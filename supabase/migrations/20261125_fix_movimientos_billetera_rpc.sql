
-- -----------------------------------------------------------------------------
-- 1) RPC genérico con autorización
-- -----------------------------------------------------------------------------
create or replace function public.get_movimientos_billetera(
  p_usuario_id uuid,
  p_tipo text default null,
  p_subtipo text default null,
  p_estado text default null,
  p_fecha_desde date default null,
  p_fecha_hasta date default null,
  p_page integer default 1,
  p_page_size integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_page integer;
  v_page_size integer;
  v_offset integer;
  v_total bigint;
  v_total_pages integer;
  v_data jsonb;
  v_total_por_tipo jsonb;
  v_tipo_item text;
  v_caller uuid := auth.uid();
begin
  -- Autorización: admin o el propio usuario
  if v_caller is null then
    raise exception 'NO_AUTORIZADO' using errcode = '42501';
  end if;

  if p_usuario_id is null then
    raise exception 'USUARIO_REQUERIDO' using errcode = '22004';
  end if;

  if p_usuario_id <> v_caller and not exists (
    select 1
    from public.usuarios u
    where u.id = v_caller
      and u.rol = 'admin'
  ) then
    raise exception 'NO_AUTORIZADO' using errcode = '42501';
  end if;

  -- Clamping
  v_page := greatest(coalesce(p_page, 1), 1);
  v_page_size := least(greatest(coalesce(p_page_size, 50), 1), 200);
  v_offset := (v_page - 1) * v_page_size;

  -- Total con todos los filtros
  select count(*)
  into v_total
  from public.movimientos_billetera m
  where m.usuario_id = p_usuario_id
    and (p_tipo is null or m.tipo = p_tipo)
    and (p_subtipo is null or m.subtipo = p_subtipo)
    and (p_estado is null or m.estado = p_estado)
    and (p_fecha_desde is null or (m.created_at at time zone 'America/Lima')::date >= p_fecha_desde)
    and (p_fecha_hasta is null or (m.created_at at time zone 'America/Lima')::date <= p_fecha_hasta);

  v_total_pages := greatest(ceil(v_total::numeric / v_page_size::numeric)::int, 1);

  -- Contadores por tipo (ignoran p_tipo)
  select jsonb_object_agg(tipo_val, cnt)
  into v_total_por_tipo
  from (
    select m.tipo as tipo_val, count(*) as cnt
    from public.movimientos_billetera m
    where m.usuario_id = p_usuario_id
      and (p_subtipo is null or m.subtipo = p_subtipo)
      and (p_estado is null or m.estado = p_estado)
      and (p_fecha_desde is null or (m.created_at at time zone 'America/Lima')::date >= p_fecha_desde)
      and (p_fecha_hasta is null or (m.created_at at time zone 'America/Lima')::date <= p_fecha_hasta)
    group by m.tipo
  ) t;

  v_total_por_tipo := coalesce(v_total_por_tipo, '{}'::jsonb);
  foreach v_tipo_item in array array['recarga', 'retiro', 'compra', 'renovacion'] loop
    if not (v_total_por_tipo ? v_tipo_item) then
      v_total_por_tipo := jsonb_set(v_total_por_tipo, array[v_tipo_item], '0'::jsonb);
    end if;
  end loop;

  -- Página + contraparte
  select coalesce(jsonb_agg(row_to_json(sub)::jsonb), '[]'::jsonb)
  into v_data
  from (
    select
      m.id,
      m.usuario_id as "usuarioId",
      m.tipo,
      m.subtipo,
      m.direccion,
      m.monto,
      m.estado,
      to_char(m.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS+00:00') as fecha,
      m.referencia_id as "referenciaId",
      m.descripcion,
      m.metadata,
      -- La contraparte solo se resuelve contra compras cuando el referencia_id
      -- es realmente un compras.id: tipo='compra' o renovacion de pedido.
      case
        when m.referencia_id is null then null
        when m.tipo = 'compra'
          or (m.tipo = 'renovacion' and m.subtipo = 'pedido')
        then
          case
            when m.direccion = 'salida' then (
              select u.usuario
              from public.compras c
              join public.usuarios u on u.id = c.proveedor_id
              where c.id = m.referencia_id
            )
            when m.direccion = 'entrada' then (
              select u.usuario
              from public.compras c
              join public.usuarios u on u.id = c.vendedor_id
              where c.id = m.referencia_id
            )
            else null
          end
        else null
      end as "contraparteUsuario",
      case
        when m.referencia_id is null then null
        when m.tipo = 'compra'
          or (m.tipo = 'renovacion' and m.subtipo = 'pedido')
        then
          case
            when m.direccion = 'salida' then 'provider'::text
            when m.direccion = 'entrada' then 'seller'::text
            else null
          end
        else null
      end as "contraparteRol"
    from public.movimientos_billetera m
    where m.usuario_id = p_usuario_id
      and (p_tipo is null or m.tipo = p_tipo)
      and (p_subtipo is null or m.subtipo = p_subtipo)
      and (p_estado is null or m.estado = p_estado)
      and (p_fecha_desde is null or (m.created_at at time zone 'America/Lima')::date >= p_fecha_desde)
      and (p_fecha_hasta is null or (m.created_at at time zone 'America/Lima')::date <= p_fecha_hasta)
    order by m.created_at desc, m.id desc
    limit v_page_size
    offset v_offset
  ) sub;

  return jsonb_build_object(
    'data', v_data,
    'total', v_total,
    'page', v_page,
    'pageSize', v_page_size,
    'totalPages', v_total_pages,
    'totalPorTipo', v_total_por_tipo
  );
end;
$function$;

-- -----------------------------------------------------------------------------
-- 2) El RPC admin pasa a ser wrapper (misma firma, mismo contrato)
-- -----------------------------------------------------------------------------
create or replace function public.get_movimientos_billetera_admin(
  p_usuario_id uuid,
  p_tipo text default null,
  p_subtipo text default null,
  p_estado text default null,
  p_fecha_desde date default null,
  p_fecha_hasta date default null,
  p_page integer default 1,
  p_page_size integer default 50
)
returns jsonb
language sql
security definer
set search_path to 'public'
as $function$
  select public.get_movimientos_billetera(
    p_usuario_id,
    p_tipo,
    p_subtipo,
    p_estado,
    p_fecha_desde,
    p_fecha_hasta,
    p_page,
    p_page_size
  );
$function$;

