-- -----------------------------------------------------------------------------
-- Purga contable de recargas/retiros antiguos.
--
-- Elimina las filas con más de N días de antigüedad (por created_at) sin
-- descuadrar la contabilidad: antes de borrar, guarda los totales purgados en
-- public.contabilidad_archivo (append-only). El balance contable y los reportes
-- suman archivo + datos vivos.
--
-- La purga archiva TODOS los estados, pero separa los montos aprobados porque
-- el balance solo cuenta estado = 'aprobado'.
-- -----------------------------------------------------------------------------

-- 1) Archivo contable ---------------------------------------------------------

create table if not exists public.contabilidad_archivo (
  id bigint generated always as identity primary key,
  periodo_desde timestamptz,
  periodo_hasta timestamptz not null,
  dias_antiguedad integer not null,
  recargas_total numeric not null default 0,
  recargas_aprobadas numeric not null default 0,
  retiros_total numeric not null default 0,
  retiros_aprobados numeric not null default 0,
  filas_recargas integer not null default 0,
  filas_retiros integer not null default 0,
  recargas_por_estado jsonb not null default '{}'::jsonb,
  retiros_por_estado jsonb not null default '{}'::jsonb,
  ejecutado_por uuid,
  ejecutado_at timestamptz not null default now()
);

comment on table public.contabilidad_archivo is
  'Totales de recargas/retiros eliminados por la purga contable. Append-only: nunca se actualiza ni se borra.';

-- Índices para que la purga no haga seq scan
create index if not exists recargas_created_at_idx
  on public.recargas (created_at);

create index if not exists retiros_created_at_idx
  on public.retiros (created_at);

-- 2) RLS: lectura para usuarios autenticados, sin escritura directa ------------

alter table public.contabilidad_archivo enable row level security;

drop policy if exists "contabilidad_archivo_select_authenticated"
  on public.contabilidad_archivo;

create policy "contabilidad_archivo_select_authenticated"
  on public.contabilidad_archivo
  for select
  to authenticated
  using (true);

revoke insert, update, delete on public.contabilidad_archivo
  from anon, authenticated;

-- 3) RPC de purga -------------------------------------------------------------

create or replace function public.purgar_recargas_retiros(
  p_dias integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_caller uuid := auth.uid();
  v_dias integer;
  v_corte timestamptz;
  v_desde_recargas timestamptz;
  v_desde_retiros timestamptz;
  v_recargas_total numeric;
  v_recargas_aprobadas numeric;
  v_retiros_total numeric;
  v_retiros_aprobados numeric;
  v_filas_recargas integer;
  v_filas_retiros integer;
  v_recargas_por_estado jsonb;
  v_retiros_por_estado jsonb;
  v_archivo_id bigint;
begin
  if v_caller is null or not exists (
    select 1
    from public.usuarios u
    where u.id = v_caller
      and u.rol = 'admin'
  ) then
    raise exception 'NO_AUTORIZADO' using errcode = '42501';
  end if;

  -- Salvaguarda: nunca purgar menos de 30 días
  v_dias := greatest(coalesce(p_dias, 60), 30);
  v_corte := now() - make_interval(days => v_dias);

  select
    coalesce(sum(monto), 0),
    coalesce(sum(monto) filter (where estado = 'aprobado'), 0),
    count(*)::integer,
    min(created_at)
  into
    v_recargas_total,
    v_recargas_aprobadas,
    v_filas_recargas,
    v_desde_recargas
  from public.recargas
  where created_at < v_corte;

  select
    coalesce(sum(monto), 0),
    coalesce(sum(monto) filter (where estado = 'aprobado'), 0),
    count(*)::integer,
    min(created_at)
  into
    v_retiros_total,
    v_retiros_aprobados,
    v_filas_retiros,
    v_desde_retiros
  from public.retiros
  where created_at < v_corte;

  if v_filas_recargas = 0 and v_filas_retiros = 0 then
    return jsonb_build_object(
      'archivo_id', null,
      'filas_recargas', 0,
      'filas_retiros', 0,
      'corte', v_corte
    );
  end if;

  select coalesce(jsonb_object_agg(estado, total), '{}'::jsonb)
  into v_recargas_por_estado
  from (
    select
      coalesce(estado::text, 'desconocido') as estado,
      count(*)::integer as total
    from public.recargas
    where created_at < v_corte
    group by 1
  ) s;

  select coalesce(jsonb_object_agg(estado, total), '{}'::jsonb)
  into v_retiros_por_estado
  from (
    select
      coalesce(estado::text, 'desconocido') as estado,
      count(*)::integer as total
    from public.retiros
    where created_at < v_corte
    group by 1
  ) s;

  insert into public.contabilidad_archivo (
    periodo_desde,
    periodo_hasta,
    dias_antiguedad,
    recargas_total,
    recargas_aprobadas,
    retiros_total,
    retiros_aprobados,
    filas_recargas,
    filas_retiros,
    recargas_por_estado,
    retiros_por_estado,
    ejecutado_por
  )
  values (
    least(v_desde_recargas, v_desde_retiros),
    v_corte,
    v_dias,
    v_recargas_total,
    v_recargas_aprobadas,
    v_retiros_total,
    v_retiros_aprobados,
    v_filas_recargas,
    v_filas_retiros,
    v_recargas_por_estado,
    v_retiros_por_estado,
    v_caller
  )
  returning id into v_archivo_id;

  delete from public.recargas where created_at < v_corte;
  delete from public.retiros where created_at < v_corte;

  return jsonb_build_object(
    'archivo_id', v_archivo_id,
    'corte', v_corte,
    'dias_antiguedad', v_dias,
    'filas_recargas', v_filas_recargas,
    'filas_retiros', v_filas_retiros,
    'recargas_total', v_recargas_total,
    'recargas_aprobadas', v_recargas_aprobadas,
    'retiros_total', v_retiros_total,
    'retiros_aprobados', v_retiros_aprobados
  );
end;
$function$;

-- 4) RPC de balance contable (vivo + archivo) --------------------------------

create or replace function public.get_balance_contable()
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  with vivo as (
    select
      coalesce((select sum(monto) from public.recargas where estado = 'aprobado'), 0)
        as recargas,
      coalesce((select sum(monto) from public.retiros where estado = 'aprobado'), 0)
        as retiros
  ),
  archivo as (
    select
      coalesce(sum(recargas_aprobadas), 0) as recargas,
      coalesce(sum(retiros_aprobados), 0) as retiros
    from public.contabilidad_archivo
  )
  select jsonb_build_object(
    'recargas_vivo', vivo.recargas,
    'retiros_vivo', vivo.retiros,
    'recargas_archivadas', archivo.recargas,
    'retiros_archivadas', archivo.retiros,
    'recargas_aprobadas', vivo.recargas + archivo.recargas,
    'retiros_aprobadas', vivo.retiros + archivo.retiros
  )
  from vivo, archivo;
$function$;

-- 5) Permisos ----------------------------------------------------------------

revoke all on function public.purgar_recargas_retiros(integer) from public;
grant execute on function public.purgar_recargas_retiros(integer) to authenticated;

revoke all on function public.get_balance_contable() from public;
grant execute on function public.get_balance_contable() to authenticated;

-- 6) Realtime: refrescar el balance cuando se inserta un archivo --------------

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contabilidad_archivo'
  ) then
    alter publication supabase_realtime add table public.contabilidad_archivo;
  end if;
end
$$;
