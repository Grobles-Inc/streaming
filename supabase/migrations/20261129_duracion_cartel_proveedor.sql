-- =============================================================================
-- Duración de cartel por producto y costos por proveedor
--
-- 1) productos.duracion_cartel_dias: 15, 30 o 180 días (6 meses).
-- 2) configuracion_proveedores: costo de publicación y renovación por cada
--    30 días, más la duración predeterminada del proveedor.
-- 3) costo_cartel_proveedor(): única fórmula de cobro escalada por duración.
-- 4) Triggers de movimientos usan esa fórmula en vez de 1.35 plano.
--
-- Cambios aditivos. Los productos existentes quedan en 30 días y los
-- proveedores sin fila usan la configuración global como respaldo.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Duración del cartel por producto
-- -----------------------------------------------------------------------------
alter table public.productos
  add column if not exists duracion_cartel_dias smallint not null default 30;

do $$
begin
  alter table public.productos
    add constraint productos_duracion_cartel_dias_check
    check (duracion_cartel_dias in (15, 30, 180)) not valid;
exception
  when duplicate_object then null;
end $$;

alter table public.productos
  validate constraint productos_duracion_cartel_dias_check;

-- -----------------------------------------------------------------------------
-- 2) Configuración por proveedor
-- -----------------------------------------------------------------------------
create table if not exists public.configuracion_proveedores (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  costo_publicacion_30d numeric(12, 2) not null default 1.35
    check (costo_publicacion_30d >= 0),
  costo_renovacion_30d numeric(12, 2) not null default 1.35
    check (costo_renovacion_30d >= 0),
  duracion_predeterminada_dias smallint not null default 30
    check (duracion_predeterminada_dias in (15, 30, 180)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.configuracion_proveedores enable row level security;

drop policy if exists "configuracion_proveedores_select_own_or_admin"
  on public.configuracion_proveedores;

create policy "configuracion_proveedores_select_own_or_admin"
  on public.configuracion_proveedores
  for select
  to authenticated
  using (
    usuario_id = auth.uid()
    or exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid()
        and u.rol = 'admin'
    )
  );

drop policy if exists "configuracion_proveedores_admin_write"
  on public.configuracion_proveedores;

create policy "configuracion_proveedores_admin_write"
  on public.configuracion_proveedores
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid()
        and u.rol = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.usuarios u
      where u.id = auth.uid()
        and u.rol = 'admin'
    )
  );

grant select, insert, update, delete
  on public.configuracion_proveedores
  to authenticated;

-- -----------------------------------------------------------------------------
-- 3) Fórmula única de costo
--
--    base por 30 días (proveedor → global → 1.35) * (días / 30), redondeado
--    a 2 decimales para que coincida con numeric(12,2) de billeteras.
-- -----------------------------------------------------------------------------
create or replace function public.costo_cartel_proveedor(
  p_proveedor_id uuid,
  p_tipo text,
  p_dias integer
)
returns numeric
language sql
stable
security definer
set search_path to 'public'
as $function$
  select round(
    coalesce(
      (
        select case
          when p_tipo = 'renovacion' then cp.costo_renovacion_30d
          else cp.costo_publicacion_30d
        end
        from public.configuracion_proveedores cp
        where cp.usuario_id = p_proveedor_id
      ),
      (
        select c.comision_publicacion_producto
        from public.configuracion c
        order by c.updated_at desc
        limit 1
      ),
      1.35
    ) * (greatest(coalesce(p_dias, 30), 0)::numeric / 30),
    2
  );
$function$;

revoke all on function public.costo_cartel_proveedor(uuid, text, integer)
  from public;
grant execute on function public.costo_cartel_proveedor(uuid, text, integer)
  to authenticated;

-- -----------------------------------------------------------------------------
-- 4) Publicación pendiente → publicado: usar duración y costo del proveedor
-- -----------------------------------------------------------------------------
create or replace function public.manejar_publicacion_producto()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  comision numeric;
  admin_id uuid;
begin
  if old.estado = 'pendiente' and new.estado = 'publicado' then
    comision := public.costo_cartel_proveedor(
      new.proveedor_id,
      'publicacion',
      new.duracion_cartel_dias
    );

    select id into admin_id
    from public.usuarios
    where rol = 'admin'
    limit 1;

    if (select saldo from public.billeteras where usuario_id = new.proveedor_id) < comision then
      raise exception 'Saldo insuficiente para publicar el producto.';
    end if;

    update public.billeteras
    set saldo = saldo - comision
    where usuario_id = new.proveedor_id;

    update public.billeteras
    set saldo = saldo + comision
    where usuario_id = admin_id;

    insert into public.movimientos_billetera (
      usuario_id, tipo, subtipo, direccion, monto, estado,
      referencia_id, descripcion, origen_key
    ) values (
      new.proveedor_id, 'gasto_publicacion', null, 'salida', comision,
      'completado', new.id, new.nombre,
      'gasto_publicacion:' || new.id || ':' || coalesce(new.fecha_expiracion::text, now()::text)
    ) on conflict (origen_key) do nothing;
  end if;

  return new;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 5) Renovación de producto: usar duración y costo de renovación del proveedor
-- -----------------------------------------------------------------------------
create or replace function public.trg_fn_productos_movimientos()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_comision numeric(12,2);
begin
  if tg_op = 'UPDATE'
    and old.fecha_expiracion is not null
    and new.fecha_expiracion > old.fecha_expiracion
    and new.estado = 'publicado'
  then
    v_comision := public.costo_cartel_proveedor(
      new.proveedor_id,
      'renovacion',
      new.duracion_cartel_dias
    );

    if new.proveedor_id is not null then
      insert into public.movimientos_billetera (
        usuario_id, tipo, subtipo, direccion, monto, estado,
        referencia_id, descripcion, origen_key, created_at
      ) values (
        new.proveedor_id, 'renovacion', 'producto', 'salida', v_comision,
        'completado', new.id, new.nombre,
        'renovacion_producto:' || new.id || ':' || new.fecha_expiracion,
        now()
      ) on conflict (origen_key) do nothing;
    end if;
  end if;

  return new;
end;
$function$;
