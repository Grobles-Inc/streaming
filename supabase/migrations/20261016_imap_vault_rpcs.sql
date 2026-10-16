-- =============================================================================
-- IMAP — acceso a Supabase Vault para las Netlify Functions
--
-- El esquema `vault` NO está expuesto en la API REST del proyecto (PostgREST
-- responde `406 PGRST106 — The schema must be one of the following: public,
-- graphql_public`), así que `supabase.schema('vault')` desde las funciones
-- fallaba siempre: guardar la config IMAP devolvía 500 "No se pudo guardar el
-- secreto", leer el secreto devolvía null y el borrado del secreto viejo solo
-- dejaba un warning. El service_role no salta esa restricción: el schema se
-- valida antes de autenticar.
--
-- Solución: wrappers en `public` que tocan Vault por dentro (security definer,
-- dueño postgres) y solo puede ejecutarlos `service_role`. El cliente sigue sin
-- poder leer ni crear secretos: `anon` / `authenticated` no tienen EXECUTE.
--
-- Los llamados a Vault usan argumentos POSICIONALES a propósito:
-- `vault.create_secret` renombró sus parámetros en supabase_vault 0.3.0
-- (`secret` → `new_secret`, etc.), y por posición funciona en 0.2.x y 0.3.x.
-- Tampoco existe `vault.delete_secret` en la extensión: borrar es un DELETE
-- sobre `vault.secrets`.
--
-- Ejecutar en Supabase → SQL Editor (una sola vez, es idempotente).
-- Desplegar junto con las funciones imap-save-config / imap-request-code
-- actualizadas: las versiones viejas siguen llamando a `.schema('vault')`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Crear un secreto y devolver su uuid
-- -----------------------------------------------------------------------------
create or replace function public.imap_vault_create_secret(p_secret text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select vault.create_secret(p_secret, null, 'IMAP app password');
$$;

-- -----------------------------------------------------------------------------
-- 2) Leer el secreto en claro por id (null si no existe)
-- -----------------------------------------------------------------------------
create or replace function public.imap_vault_read_secret(p_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where id = p_id;
$$;

-- -----------------------------------------------------------------------------
-- 3) Borrar un secreto por id (idempotente: no falla si ya no está)
-- -----------------------------------------------------------------------------
create or replace function public.imap_vault_delete_secret(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from vault.secrets where id = p_id;
$$;

-- -----------------------------------------------------------------------------
-- Grants: solo el backend (service_role). Nunca el cliente.
-- -----------------------------------------------------------------------------
revoke all on function public.imap_vault_create_secret(text) from public;
revoke all on function public.imap_vault_read_secret(uuid) from public;
revoke all on function public.imap_vault_delete_secret(uuid) from public;

revoke all on function public.imap_vault_create_secret(text)
  from anon, authenticated;
revoke all on function public.imap_vault_read_secret(uuid)
  from anon, authenticated;
revoke all on function public.imap_vault_delete_secret(uuid)
  from anon, authenticated;

grant execute on function public.imap_vault_create_secret(text) to service_role;
grant execute on function public.imap_vault_read_secret(uuid) to service_role;
grant execute on function public.imap_vault_delete_secret(uuid) to service_role;
