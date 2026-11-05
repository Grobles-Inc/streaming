-- =============================================================================
-- registrar_compra — compra transaccional + idempotente
--
-- Reemplaza la cadena de 5 llamadas REST del modal de compra:
--   createCompra -> actualizarSaldo -> stock vendido -> billetera proveedor
--   -> quitar stock del array
--
-- Todo ocurre en una sola transacción. Si cualquier paso falla, no se mueve
-- dinero, no se marca stock y no se inserta la compra.
--
-- Idempotencia: `compras.idempotency_key` + índice único parcial. El frontend
-- envía una key por intento de compra y la reutiliza en reintentos. Un replay
-- devuelve la compra ya creada sin volver a cobrar.
--
-- Ejecutar en Supabase → SQL Editor. Idempotente.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Idempotencia
-- -----------------------------------------------------------------------------
alter table public.compras
  add column if not exists idempotency_key uuid;

create unique index if not exists compras_idempotency_key_uidx
  on public.compras (idempotency_key)
  where idempotency_key is not null;

-- -----------------------------------------------------------------------------
-- 2) RPC
-- -----------------------------------------------------------------------------
create or replace function public.registrar_compra(
  p_vendedor_id uuid,
  p_producto_id bigint,
  p_nombre_cliente text,
  p_telefono_cliente text,
  p_idempotency_key uuid,
  p_stock_producto_id bigint default null
)
returns public.compras
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_producto public.productos%rowtype;
  v_stock public.stock_productos%rowtype;
  v_billetera_vendedor public.billeteras%rowtype;
  v_billetera_proveedor public.billeteras%rowtype;
  v_compra public.compras%rowtype;
  v_estado public.compra_estado;
  v_precio numeric;
begin
  -- Serializa reintentos concurrentes con la misma key. El índice único es la
  -- última defensa; este lock evita que dos requests pasen el SELECT inicial.
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));

  select * into v_compra
  from public.compras
  where idempotency_key = p_idempotency_key;

  if found then
    return v_compra;
  end if;

  -- Vendedor válido (el modal solo deja comprar a sellers)
  if not exists (
    select 1 from public.usuarios
    where id = p_vendedor_id and rol = 'seller'
  ) then
    raise exception 'VENDEDOR_INVALIDO: el usuario no existe o no es seller';
  end if;

  -- Producto publicado y comprable. FOR UPDATE (no FOR SHARE) porque después
  -- actualizamos `stock_de_productos` en la misma fila: un FOR SHARE seguido
  -- de UPDATE puede deadlockear con otra compra del mismo producto.
  select * into v_producto
  from public.productos
  where id = p_producto_id
  for update;

  if not found then
    raise exception 'PRODUCTO_NO_ENCONTRADO';
  end if;

  if v_producto.estado <> 'publicado'
     or coalesce(v_producto.deshabilitar_boton_comprar, false)
     or v_producto.proveedor_id is null then
    raise exception 'PRODUCTO_NO_DISPONIBLE: el producto no está publicado o no se puede comprar';
  end if;

  v_precio := v_producto.precio_vendedor;

  if v_precio is null or v_precio < 0 then
    raise exception 'PRECIO_INVALIDO';
  end if;

  v_estado := case
    when v_producto.disponibilidad in ('a_pedido', 'activacion') then 'pedido'::public.compra_estado
    else 'resuelto'::public.compra_estado
  end;

  -- Billetera del vendedor: lock y validación de saldo
  select * into v_billetera_vendedor
  from public.billeteras
  where usuario_id = p_vendedor_id
  for update;

  if not found then
    raise exception 'BILLETERA_NO_ENCONTRADA: el vendedor no tiene billetera';
  end if;

  if v_billetera_vendedor.saldo < v_precio then
    raise exception 'SALDO_INSUFICIENTE: saldo % < precio %',
      v_billetera_vendedor.saldo, v_precio;
  end if;

  -- Billetera del proveedor
  select * into v_billetera_proveedor
  from public.billeteras
  where usuario_id = v_producto.proveedor_id
  for update;

  if not found then
    raise exception 'BILLETERA_PROVEEDOR_NO_ENCONTRADA';
  end if;

  -- Stock disponible: SKIP LOCKED permite que compras concurrentes tomen
  -- cuentas distintas en vez de pelear por la misma.
  select * into v_stock
  from public.stock_productos
  where producto_id = p_producto_id
    and estado = 'disponible'
    and publicado is true
    and (p_stock_producto_id is null or id = p_stock_producto_id)
  order by created_at desc
  limit 1
  for update skip locked;

  if not found then
    raise exception 'SIN_STOCK: no hay cuentas disponibles para este producto';
  end if;

  -- La compra. El trigger `set_fechas_compra` calcula fecha_inicio y
  -- fecha_expiracion con now() + productos.tiempo_uso.
  insert into public.compras (
    proveedor_id,
    producto_id,
    vendedor_id,
    stock_producto_id,
    precio,
    monto_reembolso,
    estado,
    nombre_cliente,
    telefono_cliente,
    idempotency_key
  ) values (
    v_producto.proveedor_id,
    v_producto.id,
    p_vendedor_id,
    v_stock.id,
    v_precio,
    v_precio,
    v_estado,
    p_nombre_cliente,
    p_telefono_cliente,
    p_idempotency_key
  )
  returning * into v_compra;

  -- Movimientos de saldo relativos. Las filas están bloqueadas, así que no hay
  -- lost updates por lecturas concurrentes.
  update public.billeteras
  set saldo = saldo - v_precio,
      updated_at = now()
  where id = v_billetera_vendedor.id;

  update public.billeteras
  set saldo = saldo + v_precio,
      updated_at = now()
  where id = v_billetera_proveedor.id;

  -- La cuenta pasa a vendida. El WHERE revalida el estado por si acaso.
  update public.stock_productos
  set estado = 'vendido'
  where id = v_stock.id
    and estado = 'disponible';

  if not found then
    raise exception 'STOCK_NO_DISPONIBLE: la cuenta ya fue tomada';
  end if;

  -- Quitar la cuenta del array denormalizado `productos.stock_de_productos`
  -- preservando la forma de cada elemento.
  update public.productos
  set stock_de_productos = (
        select coalesce(jsonb_agg(elem), '[]'::jsonb)
        from jsonb_array_elements(
          case
            when jsonb_typeof(stock_de_productos) = 'array' then stock_de_productos
            else '[]'::jsonb
          end
        ) elem
        where coalesce((elem ->> 'id')::bigint, -1) <> v_stock.id
      ),
      updated_at = now()
  where id = v_producto.id;

  return v_compra;
end;
$function$;

-- -----------------------------------------------------------------------------
-- 3) Permisos
-- -----------------------------------------------------------------------------
revoke all on function public.registrar_compra(uuid, bigint, text, text, uuid, bigint) from public;
grant execute on function public.registrar_compra(uuid, bigint, text, text, uuid, bigint) to anon, authenticated;
