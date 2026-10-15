-- =============================================================================
-- Configuración: información de recarga (Yape / Binance)
--
-- Agrega dos columnas jsonb a public.configuracion para que el administrador
-- pueda editar el QR, los números de comunicación/yape y los datos de Binance
-- desde el panel. Ejecutar en Supabase SQL Editor una sola vez (idempotente).
-- =============================================================================

alter table public.configuracion
  add column if not exists yape_info jsonb;

alter table public.configuracion
  add column if not exists binance_info jsonb;