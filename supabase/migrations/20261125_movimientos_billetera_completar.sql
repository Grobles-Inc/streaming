-- =============================================================================
-- Movimientos de billetera — completar el ledger
--
-- 1) Nuevos tipos: gasto_publicacion y reembolso.
-- 2) Reembolso: registrar salida del proveedor y entrada del vendedor dentro
--    de manejar_reembolso_compra (el monto se calcula ahí, así que el
--    movimiento queda en la misma transacción).
-- 3) Publicación pendiente→publicado: registrar la salida del proveedor dentro
--    de manejar_publicacion_producto (ese path ya cobra en DB).
-- 4) compras: sincronizar el estado del movimiento 'compra' cuando cambia el
--    estado de la compra.
-- 5) renovación de producto: usar la misma fila de configuración que cobra el
--    frontend (updated_at desc), no id desc.
-- 6) RLS: permitir al proveedor insertar solo su propio gasto_publicacion
--    (el cobro de publicación borrador→publicado es client-side).
--
-- Idempotente. No borra ni actualiza datos existentes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Tipos permitidos
-- -----------------------------------------------------------------------------
alter table public.movimientos_billetera
  drop constraint if exists movimientos_billetera_tipo_check;

alter table public.movimientos_billetera
  add constraint movimientos_billetera_tipo_check
  check (
    tipo = any (
      array[
        'recarga'::text,
        'retiro'::text,
        'compra'::text,
        'renovacion'::text,
        'gasto_publicacion'::text,
        'reembolso'::text
      ]
    )
  );

-- -----------------------------------------------------------------------------
-- 2) RLS: el proveedor puede insertar su propio gasto de publicación
-- -----------------------------------------------------------------------------
drop policy if exists "movimientos_billetera_insert_gasto_publicacion"
  on public.movimientos_billetera;

create policy "movimientos_billetera_insert_gasto_publicacion"
  on public.movimientos_billetera
  for insert
  to authenticated
  with check (
    usuario_id = auth.uid()
    and tipo = 'gasto_publicacion'
    and direccion = 'salida'
    and subtipo is null
    and exists (
      select 1
      from public.productos p
      where p.id = referencia_id
        and p.proveedor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 3) Reembolso: registrar movimientos
-- -----------------------------------------------------------------------------
create or replace function public.manejar_reembolso_compra()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  dias_totales integer;
  dias_usados integer;
  monto_reembolso numeric;
  v_prod_nombre text;
begin
  if old.estado is distinct from new.estado and new.estado = 'reembolsado' then
    dias_totales := date_part('day', new.fecha_expiracion - new.fecha_inicio);
    dias_usados := date_part('day', now() - new.fecha_inicio);

    if dias_totales <= 0 or dias_usados >= dias_totales then
      monto_reembolso := 0;
    else
      monto_reembolso := new.precio * (1 - dias_usados::numeric / dias_totales);
    end if;

    update public.billeteras
    set saldo = saldo - monto_reembolso
    where usuario_id = new.proveedor_id;

    update public.billeteras
    set saldo = saldo + monto_reembolso
    where usuario_id = new.vendedor_id;

    if monto_reembolso > 0 then
      select nombre into v_prod_nombre
      from public.productos
      where id = new.producto_id;

      if new.proveedor_id is not null then
        insert into public.movimientos_billetera (
          usuario_id, tipo, subtipo, direccion, monto, estado,
          referencia_id, descripcion, origen_key
        ) values (
          new.proveedor_id, 'reembolso', null, 'salida', monto_reembolso,
          'completado', new.id, v_prod_nombre,
          'reembolso:' || new.id || ':' || new.proveedor_id
        ) on conflict (origen_key) do nothing;
      end if;

      if new.vendedor_id is not null then
        insert into public.movimientos_billetera (
          usuario_id, tipo, subtipo, direccion, monto, estado,
          referencia_id, descripcion, origen_key
        ) values (
          new.vendedor_id, 'reembolso', null, 'entrada', monto_reembolso,
          'completado', new.id, v_prod_nombre,
          'reembolso:' || new.id || ':' || new.vendedor_id
        ) on conflict (origen_key) do nothing;
      end if;
    end if;
  end if;

  return new;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 4) Publicación pendiente → publicado: registrar movimiento
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
    select comision_publicacion_producto into comision
    from public.configuracion
    order by updated_at desc
    limit 1;

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
-- 5) compras: sincronizar estado del movimiento 'compra'
-- -----------------------------------------------------------------------------
create or replace function public.trg_fn_compras_movimientos()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_prod_nombre text;
  v_precio numeric(12,2);
  v_renovacion_precio numeric(12,2);
begin
  if (tg_op = 'INSERT') then
    select nombre, coalesce(precio_vendedor, 0), coalesce(precio_renovacion, 0)
    into v_prod_nombre, v_precio, v_renovacion_precio
    from public.productos
    where id = new.producto_id;

    v_precio := coalesce(new.precio, v_precio, 0);

    if new.vendedor_id is not null then
      insert into public.movimientos_billetera (
        usuario_id, tipo, subtipo, direccion, monto, estado,
        referencia_id, descripcion, origen_key, created_at
      ) values (
        new.vendedor_id, 'compra', null, 'salida', v_precio, new.estado,
        new.id, v_prod_nombre,
        'compra:' || new.id || ':' || new.vendedor_id,
        coalesce(new.created_at, now())
      ) on conflict (origen_key) do nothing;
    end if;

    if new.proveedor_id is not null then
      insert into public.movimientos_billetera (
        usuario_id, tipo, subtipo, direccion, monto, estado,
        referencia_id, descripcion, origen_key, created_at
      ) values (
        new.proveedor_id, 'compra', null, 'entrada', v_precio, new.estado,
        new.id, v_prod_nombre,
        'compra:' || new.id || ':' || new.proveedor_id,
        coalesce(new.created_at, now())
      ) on conflict (origen_key) do nothing;
    end if;

  elsif (tg_op = 'UPDATE') then
    -- El movimiento de compra sigue el estado de la compra.
    update public.movimientos_billetera
    set estado = new.estado
    where tipo = 'compra'
      and referencia_id = new.id;

    if new.renovado = true
      and (old.renovado is not true or new.fecha_expiracion is distinct from old.fecha_expiracion)
    then
      select nombre, coalesce(precio_renovacion, 0)
      into v_prod_nombre, v_renovacion_precio
      from public.productos
      where id = new.producto_id;

      if new.vendedor_id is not null then
        insert into public.movimientos_billetera (
          usuario_id, tipo, subtipo, direccion, monto, estado,
          referencia_id, descripcion, origen_key, created_at
        ) values (
          new.vendedor_id, 'renovacion', 'pedido', 'salida', v_renovacion_precio,
          'completado', new.id, v_prod_nombre,
          'renovacion_pedido:' || new.id || ':' || new.vendedor_id || ':' || new.fecha_expiracion,
          now()
        ) on conflict (origen_key) do nothing;
      end if;

      if new.proveedor_id is not null then
        insert into public.movimientos_billetera (
          usuario_id, tipo, subtipo, direccion, monto, estado,
          referencia_id, descripcion, origen_key, created_at
        ) values (
          new.proveedor_id, 'renovacion', 'pedido', 'entrada', v_renovacion_precio,
          'completado', new.id, v_prod_nombre,
          'renovacion_pedido:' || new.id || ':' || new.proveedor_id || ':' || new.fecha_expiracion,
          now()
        ) on conflict (origen_key) do nothing;
      end if;
    end if;
  end if;

  return new;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 6) renovación de producto: misma configuración que cobra el frontend
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
    select coalesce(comision_publicacion_producto, 1.35)
    into v_comision
    from public.configuracion
    order by updated_at desc
    limit 1;

    v_comision := coalesce(v_comision, 1.35);

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
