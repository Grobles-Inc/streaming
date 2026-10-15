-- =============================================================================
-- IMAP Fase 5 — cambios de PM/PO (2026-10-15)
--
-- 1. imap_configs.plataforma  reemplaza a imap_configs.carpeta (INBOX fijo)
-- 2. compras.imap_enabled     toggle del proveedor: habilita la obtención de código
-- 3. codigos_verificacion.cuerpo / recibido_at  → mostrar el correo completo
-- 4. RPC get_imap_estado_pedidos   (lectura para la tabla pedidos del proveedor)
-- 5. RPC set_compras_imap_enabled   (escritura del toggle, valida ownership)
--
-- Ejecutar en Supabase → SQL Editor (una sola vez, es idempotente).
-- IMPORTANTE: esta migración DEBE desplegarse junto con las funciones
-- imap-save-config / imap-request-code actualizadas (dejan de usar `carpeta`
-- y leen/escriben plataforma, cuerpo, recibido_at, imap_enabled). Si corres el
-- SQL y las funciones viejas siguen vivas, guardar config IMAP falla.
--
-- Nota auth: el proyecto usa custom auth (public.usuarios + localStorage, sin
-- JWT de Supabase), igual que los RPC existentes (get_pedidos_proveedor,
-- get_stock_proveedor, ...). Por eso estos RPC reciben p_proveedor_id como
-- parámetro y validan ownership contra esa id en lugar de usar auth.uid().
-- Re-endurecer junto con la migración a Supabase Auth.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) imap_configs: plataforma (reemplaza carpeta)
-- -----------------------------------------------------------------------------
alter table public.imap_configs
  add column if not exists plataforma text;

-- Filas de la prueba V1 (no tenían plataforma) -> 'otra' = sin filtro
update public.imap_configs
set plataforma = 'otra'
where plataforma is null or btrim(plataforma) = '';

alter table public.imap_configs
  alter column plataforma set default 'otra',
  alter column plataforma set not null;

-- La búsqueda ahora es siempre en INBOX
alter table public.imap_configs
  drop column if exists carpeta;

-- Lista cerrada de plataformas (el <Select> del diálogo usa los mismos valores)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'imap_configs_plataforma_check'
  ) then
    alter table public.imap_configs
      add constraint imap_configs_plataforma_check
      check (plataforma in (
        'netflix', 'disney', 'chatgpt', 'spotify', 'amazon_prime', 'hbo_max',
        'youtube_premium', 'playstation', 'xbox', 'crunchyroll', 'vix',
        'adobe', 'canva', 'otra'
      ));
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2) compras.imap_enabled
-- -----------------------------------------------------------------------------
alter table public.compras
  add column if not exists imap_enabled boolean not null default false;

-- -----------------------------------------------------------------------------
-- 3) codigos_verificacion: correo completo
-- -----------------------------------------------------------------------------
alter table public.codigos_verificacion
  add column if not exists cuerpo text;

alter table public.codigos_verificacion
  add column if not exists recibido_at timestamptz;

-- =============================================================================
-- 4) RPC lectura: estado IMAP de los pedidos visibles del proveedor
--
-- v2 (Fase 5): además del toggle y la plataforma devuelve host/port/usuario/
-- ssl para que el diálogo de configuración se prellene y no haya que reescribir
-- todo al cambiar, por ejemplo, solo la plataforma. NUNCA el password: ese
-- vive en Vault y solo la función lo lee (con service_role).
--
-- Cambia el tipo de retorno, así que Postgres exige DROP + CREATE (no acepta
-- CREATE OR REPLACE con OUT params distintos).
-- =============================================================================
drop function if exists public.get_imap_estado_pedidos(uuid, integer[]);

create or replace function public.get_imap_estado_pedidos(
  p_proveedor_id uuid,
  p_compra_ids integer[]
)
returns table (
  compra_id integer,
  imap_enabled boolean,
  stock_producto_id integer,
  imap_configurado boolean,
  plataforma text,
  imap_host text,
  imap_port integer,
  imap_usuario text,
  imap_ssl boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as compra_id,
    c.imap_enabled as imap_enabled,
    c.stock_producto_id as stock_producto_id,
    (ic.id is not null) as imap_configurado,
    ic.plataforma as plataforma,
    ic.host as imap_host,
    ic.port as imap_port,
    ic.usuario as imap_usuario,
    ic.ssl as imap_ssl
  from public.compras c
  left join public.imap_configs ic
    on ic.stock_producto_id = c.stock_producto_id
  where c.proveedor_id = p_proveedor_id
    and (p_compra_ids is null or c.id = any (p_compra_ids))
    and c.stock_producto_id is not null
    and c.estado <> 'reembolsado';
$$;

-- =============================================================================
-- 5) RPC escritura: toggle del proveedor
--    No permite habilitar sin config IMAP de la cuenta asociada.
-- =============================================================================
create or replace function public.set_compras_imap_enabled(
  p_proveedor_id uuid,
  p_compra_id integer,
  p_enabled boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock_producto_id integer;
begin
  select c.stock_producto_id into v_stock_producto_id
  from public.compras c
  where c.id = p_compra_id
    and c.proveedor_id = p_proveedor_id;

  if v_stock_producto_id is null then
    raise exception 'Pedido no encontrado o no pertenece al proveedor'
      using errcode = '42501';
  end if;

  if p_enabled and not exists (
    select 1
    from public.imap_configs ic
    where ic.stock_producto_id = v_stock_producto_id
  ) then
    raise exception 'Configura el IMAP de esta cuenta antes de habilitarlo'
      using errcode = 'P0001';
  end if;

  update public.compras c
  set imap_enabled = p_enabled,
      updated_at = now()
  where c.id = p_compra_id
    and c.proveedor_id = p_proveedor_id;

  return p_enabled;
end;
$$;

-- =============================================================================
-- Grants (el cliente usa la anon key, sin sesión Supabase)
-- =============================================================================
grant execute on function public.get_imap_estado_pedidos(uuid, integer[])
  to anon, authenticated;
grant execute on function public.set_compras_imap_enabled(uuid, integer, boolean)
  to anon, authenticated;
