# Plan IMAP Automation Feature

> Objetivo: que "Obtener código" deje de usar mock y obtenga códigos reales de
> verificación leyendo el correo de la cuenta (vía IMAP), empezando por la
> configuración IMAP (diálogo "Configurar IMAP"). Backend: Supabase.

> **Estado V1 testing (2026-10-13): implementado y pendiente de pruebas.**
> Decisiones tomadas: cuentas variadas (IMAP genérico), worker en
> **Netlify Functions síncrono** (sin worker externo con poll), secretos en
> **Supabase Vault**, auth **custom `usuarios` (testing-phase)** con scope por
> compra — ver §1. Fases 1–3 del §8 hechas (fusionadas); Fase 4 pendiente.

## 0. Estado actual (frontend) — ✅ resuelto en V1

- `compras-codigo-dialog.tsx`: ~~mock~~ ahora pide el código real a
  `/.netlify/functions/imap-request-code` al abrir (loader, `InputOTP`
  readOnly + copiar, CTA a Configurar IMAP si falta config, error + Reintentar).
- `compras-imap-dialog.tsx`: ~~UI-only~~ ahora guarda vía `useSaveImapConfig`
  → Netlify Function (test de conexión IMAP + Vault server-side).
- Columna `actions` (oculta por defecto) abre ambos diálogos vía
  `ComprasContext` (`obtener_codigo` / `config_imap`). Sin cambios.
- El frontend habla con Supabase directo (`src/lib/supabase.ts`,
  `supabase.from(...)`); IMAP pasa por Netlify Functions (no Edge Functions —
  ver §1).

## 1. Decisión de arquitectura (importante)

**IMAP no puede correr en el navegador ni en una Supabase Edge Function.**

- El navegador no permite sockets TCP crudos (IMAP es TCP: puertos 143/993).
- Las Supabase Edge Functions (runtime Deno) solo permiten salida vía `fetch`;
  no hay `Deno.connect` TCP. **No se puede usar `imapflow`/`node-imap` ahí.**
- Las credenciales IMAP **nunca** deben guardarse ni usarse en el cliente.

Arquitectura recomendada:

```
[Dialog Configurar IMAP] --(POST x-user-id)--> Netlify `imap-save-config`
        --> test IMAP inline --> Vault + upsert `imap_configs`
[Dialog Obtener código] --(POST x-user-id)--> Netlify `imap-request-code`
        --> rate limit --> fila `codigo_solicitudes` --> lee Vault -->
        conecta IMAP (UNSEEN 10 min) --> extrae código --> escribe
        `codigos_verificacion` --> responde `{ codigo }` sync
[Dialog Obtener código] <-- muestra código en InputOTP (readOnly + copiar)
```

> **Desvíos V1 vs plan original:** sin Edge Functions ni worker externo con
> poll — las Netlify Functions (Node) sí permiten TCP, así que el flujo es
> **síncrono** dentro del timeout (~26s). Sin Realtime/polling en el diálogo.
> Sin Gmail/Outlook OAuth (cuentas variadas). Auth custom `usuarios` en vez de
> JWT: `auth.users` está vacío (0 filas) y la app usa `usuarios` + localStorage,
> así que las funciones identifican al caller por header `x-user-id` (spoofable
> con curl — **solo testing, no credenciales de producción** hasta migrar a
> Supabase Auth). `created_by` apunta a `public.usuarios(id)` (migración
> `supabase/migrations/20261013_imap_testing_custom_auth.sql`, revertir tras
> migrar Auth).

Componentes (hechos):

1. **Tablas Supabase** ✅ (ya existían + RLS; Vault activado).
2. **Netlify Function `imap-save-config`** ✅ (`netlify/functions/imap-save-config.js`):
   scope por compra (admin / proveedor dueño / seller con compra no
   reembolsada; `registered` denegado), test IMAP antes de guardar.
3. **Netlify Function `imap-request-code`** ✅ (`netlify/functions/imap-request-code.js`):
   mismo scope anclado a LA compra, rate limit 5 req/5 min, regex genérico
   `/\b\d{4,8}\b`, marca el email Seen, TTL 10 min.
4. **Frontend** ✅: `services/imap.ts` (`saveImapConfig`, `requestCode`,
   `ImapNeedsConfigError`), `useSaveImapConfig` / `useRequestCode` en
   `queries/index.ts`, ambos diálogos conectados.

Alternativa sin worker propio (solo si las cuentas son Gmail/Outlook):

- Usar **Gmail API** (`fetch` a `gmail.googleapis.com`) u **Outlook/Graph API**
  con OAuth2. Esto **sí** funciona dentro de una Edge Function porque es HTTPS.
  Requiere registrar OAuth app y guardar refresh tokens en Vault. Si las cuentas
  son de proveedores variados (cPanel, hosting propio), esta vía no sirve y se
  necesita el worker IMAP.

## 2. Paso 1 — Modelo de datos en Supabase ✅ hecho (tablas ya existían)

Migración de referencia (la real vive en el Dashboard; `created_by` hoy apunta
a `public.usuarios` en testing-phase, no a `auth.users` — ver
`supabase/migrations/20261013_imap_testing_custom_auth.sql`):

```sql
-- Configuración IMAP por cuenta de stock (una cuenta puede tener 1 config)
create table imap_configs (
  id uuid primary key default gen_random_uuid(),
  stock_producto_id bigint not null references stock_productos(id) on delete cascade,
  email text not null,
  host text not null,
  port int not null default 993,
  usuario text not null,
  -- Referencia al secreto en vault (nunca el password en claro)
  password_vault_id uuid not null,
  ssl boolean not null default true,
  carpeta text not null default 'INBOX',
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (stock_producto_id)
);

-- Solicitudes de código (auditoría + desacople worker)
create table codigo_solicitudes (
  id uuid primary key default gen_random_uuid(),
  compra_id bigint not null references compras(id) on delete cascade,
  stock_producto_id bigint not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','procesando','listo','error','expirado')),
  error text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now()
);

-- Códigos extraídos (lo que lee el diálogo)
create table codigos_verificacion (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references codigo_solicitudes(id) on delete cascade,
  codigo text not null,
  remitente text,
  asunto text,
  expira_at timestamptz,
  created_at timestamptz default now()
);
```

RLS (habilitar en las 3 tablas):

- `imap_configs`: `select/insert/update/delete` solo si `created_by = auth.uid()`
  (o rol proveedor/vendedor según regla de negocio: quien creó la compra).
- `codigo_solicitudes` / `codigos_verificacion`: lectura solo al `created_by`;
  escritura solo vía `service_role` (Edge Function y worker).

Índices: `codigo_solicitudes(compra_id, created_at)`,
`codigos_verificacion(solicitud_id)`.

## 3. Paso 2 — Guardar credenciales con Supabase Vault ✅ hecho

1. ~~Activar extensión~~ Vault activado en el proyecto.
2. El password/app-password se guarda con `vault.create_secret()` desde la
   Netlify Function (nunca desde el cliente). ✅
3. `imap_configs.password_vault_id` guarda solo el id del secreto. ✅
4. La función lee el secreto vía `vault.decrypted_secrets` con `service_role`,
   en memoria (nunca lo loguea ni lo devuelve al frontend). ✅
5. Al listar configs al frontend, devolver `password: '••••'` (enmascarado) —
   n/a, el frontend nunca lee la tabla directo.

## 4. Paso 3 — ~~Edge Function~~ Netlify Function `imap-request-code` ✅ hecho

`netlify/functions/imap-request-code.js` (Node, sync V1):

- Auth testing-phase: header `x-user-id` verificado contra `public.usuarios`
  (sin JWT hasta migrar Auth).
- Input: `{ compra_id }`. Scope: admin, seller dueño de ESA compra, o
  proveedor dueño. `registered` denegado.
- Rate limit: 5 solicitudes / 5 min por compra (429 si excede).
- Crea fila en `codigo_solicitudes` (`pendiente` → `procesando` →
  `listo`/`error`). Sin worker externo: la misma invocación conecta IMAP y
  responde `{ codigo, solicitud_id, remitente, asunto }`.
- `imap-save-config` hace el test de conexión al guardar (el diálogo muestra
  "Verificando…").

## 5. Paso 4 — ~~Worker IMAP externo~~ inline en la función ✅ hecho (V1)

Sin servicio separado: `imapflow` corre dentro de `imap-request-code`
(dep `imapflow@2.4.0` en `package.json`):

- Loop por invocación:
  1. Solicitud `pendiente` → `procesando`.
  2. Lee `imap_configs` + secreto de Vault.
  3. Conecta IMAP (host, port, `secure: ssl`, auth usuario/pass).
  4. Busca en `carpeta`: `UNSEEN` últimos 10 min, más nuevos primero (máx. 10).
  5. Extrae código genérico `/\b\d{4,8}\b` (subject + body con manejo de
     HTML / quoted-printable / base64).
  6. Inserta en `codigos_verificacion` (TTL 10 min), solicitud `listo`
     (o `error` con motivo).
  7. Marca el email como Seen, cierra conexión.
- Env vars (Netlify + `.env` local): `SERVICE_ROLE_KEY`,
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Logs sin credenciales ni códigos completos (código enmascarado `12***`).

## 6. Paso 5 — Conectar el frontend existente ✅ hecho

`src/features/vendedor/compras/`:

1. **Services** (`services/imap.ts`): ✅
   - `saveImapConfig(input, userId)` → `/.netlify/functions/imap-save-config`.
   - `requestCode(compraId, userId)` → `/.netlify/functions/imap-request-code`,
     lanza `ImapNeedsConfigError` si falta config.
2. **Queries** (`queries/index.ts`): ✅ `useSaveImapConfig`, `useRequestCode`
   (sync, sin Realtime/polling en V1).
3. **Diálogos**: ✅
   - `compras-imap-dialog.tsx`: `onSubmit` → `useSaveImapConfig` ("Verificando…").
   - `compras-codigo-dialog.tsx`: al abrir → `requestCode`; loader, código en
     `InputOTP` readOnly (slots dinámicos 4–8) + copiar, CTA a Configurar IMAP,
     error + Reintentar. Mock eliminado.
4. **Schema**: sin cambios (no se agregó badge `imap_configurada`).

## 7. Paso 6 — Seguridad (checklist V1)

- [x] RLS activado en las 3 tablas; cliente nunca usa `service_role`
      (solo las Netlify Functions).
- [x] Passwords solo en Vault; frontend jamás recibe secretos en claro.
- [x] La función valida scope por compra (admin / dueño / seller con compra;
      `registered` denegado). ⚠️ testing-phase: `x-user-id` spoofeable —
      re-endurecer con JWT al migrar a Supabase Auth.
- [x] Rate limit: 5 solicitudes por compra / 5 min en la función.
- [x] Logs sin credenciales ni códigos completos (enmascarar).
- [x] `expira_at` en códigos (10 min). Limpieza periódica pendiente (Fase 4).

## 8. Fases de entrega — estado

1. **Fase 1 — Persistencia** ✅: tablas + Vault + guardar config desde el
   diálogo (con test de conexión real inline, no simulado).
2. **Fase 2 — Worker + extracción** ✅ (fusionada: inline en Netlify Function,
   1 proveedor de prueba con app-password, regex genérico).
3. **Fase 3 — Obtener código real** ✅: Netlify Function sync + diálogo sin
   mock (sin Realtime/polling en V1).
4. **Fase 4 — Endurecer** ⏳ pendiente: migrar a Supabase Auth (JWT +
   `created_by → auth.users`), `codigo_regex` por producto, reintentos con
   backoff, limpieza de expirados, monitoreo (alerta si `error` > X%).

## 9. Qué NO hacer

- No conectar IMAP desde el frontend (imposible + expone credenciales).
- No guardar passwords en claro en ninguna tabla.
- No usar la `anon key` ni `service_role` en el cliente para estas tablas.
- No asumir un formato único de código: cada servicio (Netflix, Disney, etc.)
  envía remitentes/asuntos distintos → regex configurable por producto
  (pendiente en Fase 4; V1 usa regex genérico).

## 10. Caso de prueba V1 — cómo probar la automatización IMAP

> Pre-requisitos: correr con `netlify dev` (en `vite dev` las funciones no
> existen y el diálogo muestra el error correspondiente). Usar solo cuentas de
> correo de prueba. `SERVICE_ROLE_KEY` configurada en Netlify y en `.env`.
> Migración `20261013_imap_testing_custom_auth.sql` aplicada.

### Caso 1 — Configurar IMAP con credenciales correctas

1. Entrar como proveedor (o seller con una compra no reembolsada sobre la
   cuenta) e ir a Compras.
2. Abrir el menú de la compra → **Configurar IMAP**.
3. Completar host, puerto, usuario, **app-password** (no la clave normal si el
   proveedor exige app-passwords, ej. Gmail), SSL y carpeta `INBOX`.
4. Guardar.
5. **Esperado:** estado "Verificando…" y luego toast de éxito. En Supabase:
   fila en `imap_configs` para ese `stock_producto_id` con
   `password_vault_id` apuntando a un secreto de Vault (el password en claro
   no aparece en ninguna tabla ni en los logs de la función).

### Caso 2 — Configurar IMAP con credenciales incorrectas

1. Repetir el Caso 1 con una contraseña errónea.
2. **Esperado:** toast "No se pudo conectar al correo…" y **no** se crea ni
   actualiza ninguna fila en `imap_configs`.

### Caso 3 — Obtener un código real

1. Con IMAP configurado (Caso 1), provocar el envío del código desde la
   plataforma del servicio (ej. "Enviar código por correo") para la cuenta de
   la compra.
2. Dentro de los 10 minutos, abrir **Obtener código** en esa compra.
3. **Esperado:** loader "Conectando con el correo…", luego el código en el
   `InputOTP` (solo lectura) más el remitente, y el botón Copiar lo deja en el
   portapapeles. En Supabase: solicitud en `codigo_solicitudes` en `listo` y
   fila en `codigos_verificacion` con `codigo`, `remitente`, `asunto` y
   `expira_at` ~10 min. El correo queda marcado como visto.

### Caso 4 — Obtener código sin correos nuevos

1. Sin pedir ningún código al servicio, abrir **Obtener código**.
2. **Esperado:** mensaje "No llegó ningún correo nuevo en los últimos
   10 minutos…" + botón Reintentar. La solicitud queda en `error` (auditoría).

### Caso 5 — Obtener código sin IMAP configurado

1. Elegir una compra cuya cuenta no tenga config y abrir **Obtener código**.
2. **Esperado:** mensaje con botón **Configurar IMAP** que cambia al diálogo
   de configuración manteniendo la compra actual.

### Caso 6 — Scope por compra (seguridad testing-phase)

1. Como seller A con compra sobre la cuenta X, configurar/obtener código:
   **permitido**.
2. Como seller B sin compra sobre la cuenta X, intentar lo mismo (o llamar a
   la función con otro `compra_id`): **403 "Sin acceso"**.
3. Como `registered`: **403 siempre**.

### Caso 7 — Rate limit

1. Abrir **Obtener código** 6 veces seguidas sobre la misma compra en menos de
   5 minutos.
2. **Esperado:** a partir del 6.º intento, error 429 "Demasiadas
   solicitudes…".

### Qué registrar como bugs de V1

- Código incorrecto (ej. toma un n.º de pedido en vez del código): anotar
  remitente + asunto + formato real → insumo para `codigo_regex` (Fase 4).
- Correo que llega pero no se detecta (HTML solo-base64, otro idioma):
  anotar proveedor de correo → insumo para mejorar `extractCode`.
- Tiempos > 20s sostenidos: Netlify corta en ~26s; anotar proveedor para
  evaluar carpeta/ventana de búsqueda más acotada.
