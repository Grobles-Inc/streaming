# Plan IMAP Automation Feature

> Objetivo: que "Obtener código" deje de usar mock y obtenga códigos reales de
> verificación leyendo el correo de la cuenta (vía IMAP), empezando por la
> configuración IMAP (diálogo "Configurar IMAP"). Backend: Supabase.

> **Estado V2 (2026-10-15): V1 tested + cambios de PM/PO aplicados.** Fases 1–3
> hechas y probadas en producción; Fase 5 (cambios de producto) implementada,
> pendiente de deploy/prueba. Decisiones: cuentas variadas (IMAP genérico), worker
> en **Netlify Functions síncrono** (sin worker externo con poll), secretos en
> **Supabase Vault**, auth **custom `usuarios` (testing-phase)** con scope —
> ver §1 y §11.

## 0. Dónde vive cada cosa (V2)

- **Configuración IMAP → tabla Pedidos del proveedor** (`···` → Configurar
  IMAP, en `src/features/proveedor/pedidos/components/imap-config-dialog.tsx`).
  Antes vivía en Compras (borrado `compras-imap-dialog.tsx`).
- **Toggle por compra → `compras.imap_enabled`**, columna IMAP en Pedidos
  (Switch). Solo si el proveedor lo activa aparece "Obtener código" en el menú
  `···` de Compras.
- **Obtención de código → tabla Compras del vendedor**
  (`compras-codigo-dialog.tsx`): código + **correo completo** (remitente, asunto,
  fecha, cuerpo).
- **Búsqueda por plataforma**: `imap_configs.plataforma` (lista fija) reemplaza a
  `carpeta`; los correos de verificación se buscan siempre en `INBOX`.
- El frontend habla con Supabase directo (`src/lib/supabase.ts`,
  `supabase.from(...)`); IMAP pasa por Netlify Functions (no Edge Functions —
  ver §1).

## 1. Decisión de arquitectura (importante)

**IMAP no puede correr en el navegador ni en una Supabase Edge Function.**

- El navegador no permite sockets TCP crudos (IMAP es TCP: puertos 143/993).
- Las Supabase Edge Functions (runtime Deno) solo permiten salida vía `fetch`;
  no hay `Deno.connect` TCP. **No se puede usar `imapflow`/`node-imap` ahí.**
- Las credenciales IMAP **nunca** deben guardarse ni usarse en el cliente.

Arquitectura actual (V2):

```
[Pedidos · proveedor ···· → Configurar IMAP] --(POST x-user-id)-->
        Netlify `imap-save-config` --> valida plataforma --> test IMAP
        (INBOX) --> Vault + upsert `imap_configs` (stock_producto_id + plataforma)
[Pedidos · columna IMAP (Switch)] --(RPC set_compras_imap_enabled)-->
        `compras.imap_enabled` (por compra)
[Compras · vendedor ···· → Obtener código] --(POST x-user-id)-->
        Netlify `imap-request-code` --> valida `compras.imap_enabled` -->
        rate limit --> fila `codigo_solicitudes` --> lee Vault --> conecta IMAP
        (INBOX, UNSEEN 10 min) --> filtra por plataforma (remitente/asunto) -->
        extrae código --> escribe `codigos_verificacion` (cuerpo + recibido_at)
        --> responde `{ codigo, cuerpo, ... }` sync
[Compras · diálogo] <-- código en InputOTP (readOnly + copiar) + correo completo
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
   scope admin / proveedor dueño del stock (`registered` y `seller` denegados
   desde V2), valida `plataforma`, test IMAP contra INBOX antes de guardar.
3. **Netlify Function `imap-request-code`** ✅ (`netlify/functions/imap-request-code.js`):
   scope anclado a LA compra + gate de `compras.imap_enabled`, rate limit
   5 req/5 min, filtro por plataforma, regex genérico `/\b\d{4,8}\b`, guarda el
   correo completo, marca el email Seen, TTL 10 min.
4. **RPC** ✅ `get_imap_estado_pedidos` (lectura para la tabla Pedidos) y
   `set_compras_imap_enabled` (toggle del proveedor, exige config previa).
   `get_pedidos_proveedor` quedó intacto.
5. **Frontend** ✅: `proveedor/pedidos/{services/imap.ts, components/imap-config-dialog.tsx,
   data/plataformas.ts}` y `vendedor/compras/{services/imap.ts (requestCode),
   components/compras-codigo-dialog.tsx}`.

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
- **Gate del proveedor:** si `compras.imap_enabled = false` → `403
  { not_enabled: true }` (admin exento para poder debuggear).
- Rate limit: 5 solicitudes / 5 min por compra (429 si excede).
- Crea fila en `codigo_solicitudes` (`pendiente` → `procesando` →
  `listo`/`error`). Sin worker externo: la misma invocación conecta IMAP y
  responde `{ codigo, solicitud_id, remitente, asunto, cuerpo, recibido_at,
  plataforma }`.
- `imap-save-config` hace el test de conexión al guardar (el diálogo muestra
  "Verificando…").

## 5. Paso 4 — ~~Worker IMAP externo~~ inline en la función ✅ hecho (V1)

Sin servicio separado: `imapflow` corre dentro de `imap-request-code`
(dep `imapflow@2.4.0` en `package.json`):

- Loop por invocación:
  1. Solicitud `pendiente` → `procesando`.
  2. Lee `imap_configs` + secreto de Vault.
  3. Conecta IMAP (host, port, `secure: ssl`, auth usuario/pass).
  4. Busca en **`INBOX`** (ya no hay carpeta configurable): `UNSEEN` últimos
     10 min, más nuevos primero (máx. 10).
  5. **Filtra por plataforma**: `PLATAFORMA_KEYWORDS[plataforma]` se matchea
     (case-insensitive) contra remitente + asunto. `otra` = sin filtro.
  6. Extrae código genérico `/\b\d{4,8}\b` y guarda el cuerpo completo en
     texto plano (`toPlainText`: quoted-printable/base64 resueltos, HTML fuera,
     máx 8000 chars) + `recibido_at` (date del envelope).
  7. Inserta en `codigos_verificacion` (TTL 10 min), solicitud `listo`
     (o `error` con motivo).
  8. Marca el email como Seen, cierra conexión.
- Env vars (Netlify + `.env` local): `SERVICE_ROLE_KEY`,
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Node 22 fijado en
  `netlify.toml` (`imapflow` exige node >= 20).
- Logs sin credenciales ni códigos completos (código enmascarado `12***`).

## 6. Paso 5 — Conectar el frontend existente ✅ hecho

`src/features/proveedor/pedidos/` (proveedor, V2):

1. **Services** (`services/imap.ts`): `saveImapConfig(input, userId)` →
   `/.netlify/functions/imap-save-config`; `getImapEstadoPedidos(proveedorId,
   compraIds)` → RPC; `setImapEnabled(proveedorId, compraId, enabled)` → RPC.
2. **Queries** (`queries/index.ts`): `useSaveImapConfig`,
   `useToggleImapEnabled`.
3. **`getPedidosProveedor`** mergea el estado IMAP de la página en cada fila
   (`imap_enabled`, `imap_configurado`, `imap_plataforma`).
4. **UI**: columna IMAP con Switch (deshabilitado + tooltip si la cuenta no
   tiene config) e item "Configurar IMAP" en las row actions.
5. **Plataformas** (`data/plataformas.ts`): 14 slugs, espejo del CHECK
   constraint `imap_configs_plataforma_check` y de la whitelist de las funciones.

`src/features/vendedor/compras/` (vendedor):

1. **Service** (`services/imap.ts`): `requestCode(compraId, userId)` →
   `/.netlify/functions/imap-request-code`; lanza `ImapNeedsConfigError` /
   `ImapNotEnabledError` (sin toast, los muestra el diálogo).
2. **Query**: `useRequestCode` (sync, sin Realtime/polling).
3. **UI**: "Obtener código" en el menú `···` solo si `compra.imap_enabled`;
   el diálogo muestra loader, código (`InputOTP` readOnly) + Copiar y el correo
   completo (De / Asunto / Recibido / cuerpo en `ScrollArea`).
4. **Schema**: `compraSchema` suma `imap_enabled`; `compras-context` perdió
   `config_imap` y `compras-dialogs.tsx` ya no monta el diálogo de IMAP.

## 7. Paso 6 — Seguridad (checklist V1)

- [x] RLS activado en las 3 tablas; cliente nunca usa `service_role`
      (solo las Netlify Functions).
- [x] Passwords solo en Vault; frontend jamás recibe secretos en claro.
- [x] La función valida scope (request-code: admin / dueño / seller con esa
      compra; save-config: admin / proveedor dueño) y `registered` denegado.
      ⚠️ testing-phase: `x-user-id` spoofeable — re-endurecer con JWT al migrar
      a Supabase Auth. Los RPC nuevos reciben `p_proveedor_id` y validan
      ownership (misma postura weak-auth que el resto de la app).
- [x] Rate limit: 5 solicitudes por compra / 5 min en la función.
- [x] Logs sin credenciales ni códigos completos (enmascarar).
- [x] `expira_at` en códigos (10 min). Limpieza periódica pendiente (Fase 4).
- [x] El toggle `compras.imap_enabled` es la única puerta de entrada del
      vendedor: sin él no hay botón ni acceso a la función.

## 8. Fases de entrega — estado

1. **Fase 1 — Persistencia** ✅: tablas + Vault + guardar config desde el
   diálogo (con test de conexión real inline, no simulado).
2. **Fase 2 — Worker + extracción** ✅ (fusionada: inline en Netlify Function,
   1 proveedor de prueba con app-password, regex genérico).
3. **Fase 3 — Obtener código real** ✅: Netlify Function sync + diálogo sin
   mock (sin Realtime/polling en V1). **Probado en producción.**
4. **Fase 4 — Endurecer** ⏳ pendiente: migrar a Supabase Auth (JWT +
   `created_by → auth.users`), `codigo_regex` por producto, reintentos con
   backoff, limpieza de expirados, monitoreo (alerta si `error` > X%),
   limpiar secretos huérfanos de Vault al re-guardar config.
5. **Fase 5 — Cambios de PM/PO (2026-10-15)** ✅ implementada, pendiente de
   deploy/prueba: ver §11.

## 9. Qué NO hacer

- No conectar IMAP desde el frontend (imposible + expone credenciales).
- No guardar passwords en claro en ninguna tabla.
- No usar la `anon key` ni `service_role` en el cliente para estas tablas.
- No asumir un formato único de código: cada servicio (Netflix, Disney, etc.)
  envía remitentes/asuntos distintos → regex configurable por producto
  (pendiente en Fase 4; V1 usa regex genérico).

## 10. Caso de prueba V2 (V1.1) — cómo probar la automatización IMAP

> Pre-requisitos: en local hace falta `netlify dev` (en `vite dev` las funciones
> no existen y el diálogo muestra el error correspondiente); en producción,
> deploy con `SERVICE_ROLE_KEY` en el contexto Production. Solo cuentas de
> correo de prueba. Migraciones aplicadas: `20261013_imap_testing_custom_auth.sql`
> y `20261015_imap_plataforma_habilitado.sql`.

### Caso 1 — Configurar IMAP (lado proveedor) con credenciales correctas

1. Entrar como **proveedor** → **Pedidos**.
2. Menú `···` de un pedido con cuenta → **Configurar IMAP**.
3. Completar email, **Plataforma** (ej. Netflix), host, puerto, usuario,
   **app-password** (no la clave normal si el proveedor exige app-passwords) y
   SSL. No hay campo de carpeta.
4. Guardar.
5. **Esperado:** "Verificando…" y luego toast de éxito. En Supabase: fila en
   `imap_configs` con `plataforma = 'netflix'` y `password_vault_id` apuntando
   a un secreto de Vault (el password en claro no aparece en ninguna tabla ni
   en los logs). La columna IMAP de esa fila pasa a mostrar la plataforma.

> **Cómo lo maneja el sistema:** el frontend valida la forma con zod y el
> `<Select>` de `data/plataformas.ts` (14 opciones, espejo del CHECK de SQL).
> `imap-save-config` valida de nuevo la plataforma contra su whitelist, resuelve
> el secreto (nuevo en Vault, o reutiliza el existente si no mandamos password),
> **conecta IMAP contra INBOX antes de guardar** y recién ahí hace el upsert. Si
> el test falla devuelve 400 y no escribe nada. El cliente invalida
> `['pedidos']`, así que la columna IMAP se repinta sola.

### Caso 2 — Configurar IMAP con credenciales incorrectas

1. Repetir el Caso 1 con una contraseña errónea.
2. **Esperado:** toast "No se pudo conectar al correo…" y **no** se crea ni
   actualiza ninguna fila en `imap_configs`.

> **Cómo lo maneja el sistema:** el test de conexión va **antes** del
> `vault.create_secret` y del upsert, así que una contraseña mala no deja
> secretos huérfanos ni rows a medias. El error real de IMAP se loguea en la
> función (`console.warn`) pero al cliente solo se le devuelve el mensaje
> genérico, sin detalles del servidor de correo.

### Caso 2b — Cambiar solo la plataforma (password vacío) y purga de Vault

1. Con la config ya guardada (Caso 1), reabrir **Configurar IMAP**: el host,
   puerto, usuario y plataforma vienen precargados, el password vacío y el
   label dice "Nueva contraseña (opcional)".
2. Cambiar solo la plataforma y guardar **sin** escribir password.
3. **Esperado:** toast de éxito, `plataforma` actualizada en `imap_configs` y
   el `password_vault_id` **igual** que antes (mismo secreto reusado).
4. Ahora guardar otra vez **con** una password nueva.
5. **Esperado:** `password_vault_id` cambia y el secreto anterior **desaparece**
   de `vault.secrets` (query: `select id, name from vault.secrets order by
   created_at desc`). Si el borrado falla, el guardado igual es exitoso y solo
   queda un warning en los logs de la función.

> **Cómo lo maneja el sistema:** el RPC `get_imap_estado_pedidos` devuelve
> `host/port/usuario/ssl/plataforma` (nunca el password) y el servicio los
> mergea en cada fila del pedido, así que el diálogo abre con lo guardado. Si
> `password` llega vacío, la función lee el secreto de Vault con `service_role`,
> reusa el `password_vault_id` y testea la conexión con él. Si llega con valor,
> crea el secreto nuevo y **después** del upsert borra el anterior
> (`vault.delete_secret`) — nunca antes, para no dejar la fila apuntando a un
> secreto inexistente.

### Caso 3 — El toggle del proveedor

1. En la misma fila, la columna IMAP: el Switch debe estar apagado y, si no
   hubiera config, deshabilitado con tooltip "Configura el IMAP de esta cuenta".
2. Encenderlo.
3. **Esperado:** toast de éxito, `compras.imap_enabled = true` en Supabase, y
   el Switch queda en verde. Con IMAP sin configurar, el RPC lo rechaza:
   "Configura el IMAP de esta cuenta antes de habilitarlo".
4. Volver a apagarlo → `imap_enabled = false`.

> **Cómo lo maneja el sistema:** `set_compras_imap_enabled` es `security
> definer`: valida que la compra pertenezca al `p_proveedor_id` recibido y que
> exista config IMAP antes de permitir el alta (el Switch además sale
> deshabilitado en la UI, pero la regla real está en el RPC). Invalida
> `['pedidos']` tras el toggle.

### Caso 4 — El vendedor ve (o no) "Obtener código"

1. Con el toggle apagado, entrar como el **vendedor** de esa compra → Compras.
2. **Esperado:** el botón `···` de esa fila **no aparece** (la columna Acciones
   ahora es visible por defecto; si el vendedor la ocultó, puede reactivarla con
   el botón de columnas en desktop).
3. Encender el toggle como proveedor y recargar: ahora sí aparece.
4. Con el toggle apagado, pedir el código por curl contra la función:
   `403 { not_enabled: true }`. Con toggle encendido pero sin config:
   `400 { needs_config: true }`.

> **Cómo lo maneja el sistema:** la UI esconde el ítem por fila
> (`AccionesCell` retorna `null` si `!row.imap_enabled`) y la Netlify Function
> valida lo mismo antes de leer el Vault — la restricción no depende del
> frontend. `admin` está exento del gate para poder debuggear.

### Caso 5 — Obtener un código real (flujo completo)

1. Con IMAP configurado (Caso 1) y toggle encendido (Caso 3), provocar el
   envío del código desde la plataforma del servicio para la cuenta de la compra.
2. Dentro de los 10 minutos, abrir **Obtener código** en Compras.
3. **Esperado:** loader "Conectando con el correo…", luego el código en el
   `InputOTP` (solo lectura) + **Copiar**, y debajo el **correo completo**:
   remitente, asunto, fecha de recepción y el cuerpo en texto plano con scroll.
   En Supabase: solicitud `listo` y fila en `codigos_verificacion` con `codigo`,
   `remitente`, `asunto`, `cuerpo`, `recibido_at`, `expira_at` ~10 min. El
   correo queda marcado como visto.

> **Cómo lo maneja el sistema:** al abrir el diálogo se dispara **una sola** vez
> la mutación (guard con `useRef`, a prueba del doble efecto de StrictMode).
> La función: valida scope → gate `imap_enabled` → rate limit → crea
> `codigo_solicitudes` (`pendiente` → `procesando`) → lee el secreto de Vault →
> conecta IMAP → busca `UNSEEN` de los últimos 10 min, más nuevos primero
> (máx 10) → filtra por plataforma → extrae el código, guarda el cuerpo como
> texto plano y marca el email como Seen → responde. Todo síncrono dentro del
> timeout de Netlify (~26 s); el log solo muestra el código enmascarado (`12***`).

### Caso 6 — El filtro por plataforma

1. Configurar la cuenta con plataforma **Netflix** y pedir un código de
   **Disney** a esa misma casilla.
2. **Esperado:** "No llegó ningún correo de Netflix en los últimos 10
   minutos…" (no toma el código de Disney).
3. Cambiar la plataforma a `otra` (sin filtro) y reintentar: ahora sí toma el
   primer código 4–8 dígitos de cualquier correo no leído.

> **Cómo lo maneja el sistema:** `PLATAFORMA_KEYWORDS` mapea cada slug a sus
> palabras clave (`chatgpt` → `openai|chatgpt`, `amazon_prime` →
> `amazon|primevideo`, etc.) y se matchea en minúsculas contra remitente +
> asunto antes de extraer el código. `otra` tiene lista vacía = sin filtro
> (comportamiento V1). El filtro se aplica en JS sobre los correos ya bajados,
> no con `SEARCH TEXT`, porque no todos los servidores lo implementan igual.

### Caso 7 — Obtener código sin correos nuevos

1. Sin pedir código al servicio, abrir **Obtener código**.
2. **Esperado:** mensaje "No llegó ningún correo nuevo…" + Reintentar. La
   solicitud queda en `error` (auditoría).

> **Cómo lo maneja el sistema:** la búsqueda es `UNSEEN` + `since` (10 min). Si
> no hay UIDs, la función marca la solicitud `error` con el motivo y devuelve
> 404; el diálogo muestra el mensaje y el botón Reintentar (mismo camino de
> error que cualquier otro fallo).

### Caso 8 — Scope por compra (seguridad testing-phase)

1. Como seller A con compra sobre la cuenta X, pedir el código: **permitido**.
2. Como seller B sin compra sobre la cuenta X (o `compra_id` ajeno): **403
   "Sin acceso a esta compra"**.
3. Como `seller` intentando **configurar** IMAP: **403** (config es solo del
   proveedor o admin).
4. Como `registered`: **403 siempre**.

> **Cómo lo maneja el sistema:** ambas funciones resuelven el caller desde
> `x-user-id` contra `public.usuarios` (custom auth, sin JWT) y chequean rol +
> relación con la compra/stock antes de tocar el Vault. **Recordatorio:** el
> header es spoofeable con `curl`; es la misma postura weak-auth que el resto
> del proyecto y la razón por la que todavía no hay credenciales reales.

### Caso 9 — Rate limit

1. Abrir **Obtener código** 6 veces seguidas sobre la misma compra en menos de
   5 minutos.
2. **Esperado:** a partir del 6.º intento, error 429 "Demasiadas
   solicitudes…".

> **Cómo lo maneja el sistema:** se cuentan las filas de `codigo_solicitudes`
> de los últimos 5 min para esa compra (contando las fallidas) antes de
> conectar IMAP. Es deliberado: también frena a alguien que reintenta en loop
> esperando que llegue el correo.

### Edge cases — para discutir en la próxima reunión

> No son bugs conocidos, son situaciones que el diseño actual no cubre. Cada
> uno lleva lo que hace el sistema hoy y qué habría que decidir.

**E1 — Dos pestañas / doble clic pidiendo el mismo código**
- Hoy: la primera llamada marca el email como Seen; la segunda no encuentra
  nada y responde "No llegó ningún correo nuevo…". Para el vendedor parece un
  bug aunque el sistema esté bien.
- A decidir: ¿depurar la ventana de Seen (permitir releer el último correo
  encontrado por esa misma solicitud) o se documenta y se deja?

**E2 — El correo llega a Spam/Otros, no a INBOX**
- Hoy: no se encuentra nada (por eso se quitó la carpeta configurable).
- A decidir: ¿barrido secondary en `\Junk` / "Others" cuando INBOX no arroja
  resultados? En Gmail, marcar "Enviados".

**E3 — Una misma casilla para dos plataformas (Netflix y Disney)**
- Hoy: `imap_configs` es UNIQUE por `stock_producto_id`, así que hace falta una
  fila de stock por plataforma aunque la casilla sea la misma; el proveedor
  configura cada una con su plataforma. Con `otra` se pierde el filtro.
- A decidir: ¿se modela la config por `(stock_producto_id, plataforma)`
  permitiendo varias plataformas en una misma fila de stock, o se sigue con
  filas de stock separadas?

**E4 — El proveedor apaga el toggle con el vendedor usando el diálogo**
- Hoy: la llamada en vuelo pasa (el gate se evaluó al entrar); la siguiente
  devuelve 403 y el vendedor ve el mensaje con Reintentar.
- A decidir: ¿basta el mensaje o hace falta Realtime para cerrarle el
  diálogo?

**E5 — El código expira a los 10 minutos**
- Hoy: `expira_at` es informativo; el vendedor puede seguir copiando lo que
  tiene en pantalla. Si el cliente lo necesita tarde hay que re-pedirlo (y el
  correo viejo ya está Seen, así que solo funciona si llega uno nuevo).
- A decidir: ¿mostrar cuenta regresiva / avisar que expiró?

**E6 — El correo ya llegó leído (otro dispositivo del proveedor lo abrió)**
- Hoy: no se detecta, porque la búsqueda filtra `UNSEEN`.
- A decidir: ¿fallback "último correo de la plataforma en 24h" cuando no hay
  nada UNSEEN? Reduce falsos negativos, a costa de exponer códigos viejos.

**E7 — Correos sin leer que no son de la plataforma, con números dentro**
- Hoy: el filtro por plataforma los descarta; con `otra` el regex puede tomar
  un número de pedido o un teléfono del primer correo que vea.
- A decidir: ¿`otra` debería pedir confirmación del vendedor o mostrar el
  remitente antes de devolver el código? (El remitente ya se muestra.)

**E8 — El rate limit de 5 por 5 min puede ser bajo en soporte**
- Hoy: 5 aperturas del diálogo en 5 min bloquean al vendedor, incluso si solo
  estaba mirando.
- A decidir: ¿subir el límite, o hacerlo por usuario en vez de por compra?

### Qué registrar como bugs de V2

- **Keywords de plataforma que no matchean** (correo legítimo llega pero la
  función dice "No llegó ningún correo de X"): anotar remitente y asunto
  exactos → se agrega el keyword al mapa de la función.
- Código incorrecto (toma un n.º de pedido): anotar remitente + asunto + cuerpo
  → insumo para `codigo_regex` (Fase 4).
- `cuerpo` ilegible (HTML que no se limpia bien, base64 doble): anotar el
  proveedor → insumo para mejorar `toPlainText`.
- Tiempos > 20s sostenidos: Netlify corta en ~26s; anotar proveedor para
  evaluar acortar la ventana de búsqueda.

## 11. Fase 5 — Cambios de PM/PO (2026-10-15)

Pedido: (1) obtención de código en Compras del vendedor, (2) config IMAP en
Pedidos del proveedor + toggle de habilitado visible para el vendedor,
(3)/(4) `plataforma` en vez de `carpeta`, (5) mostrar el correo completo.

| # | Cambio | Dónde |
|---|--------|-------|
| 1 | "Obtener código" solo en Compras y **solo si `compra.imap_enabled`** | `vendedor/compras/components/columns.tsx` |
| 2 | Config IMAP en Pedidos + Switch por compra | `proveedor/pedidos/components/{imap-config-dialog.tsx, columns.tsx, data-table-row-actions.tsx}` |
| 3/4 | `plataforma` (lista fija) reemplaza `carpeta`; búsqueda siempre en INBOX + filtro por remitente/asunto | `imap_configs`, `services/plataformas.ts`, ambas functions |
| 5 | `codigo_solicitud` guarda `cuerpo` + `recibido_at`; el diálogo los muestra | `codigos_verificacion`, `compras-codigo-dialog.tsx` |

Modelo de datos (`20261015_imap_plataforma_habilitado.sql`):

- `compras.imap_enabled boolean not null default false`.
- `imap_configs.plataforma text not null default 'otra'` + CHECK con los 14
  slugs; se dropea `imap_configs.carpeta`. UNIQUE sigue en
  `stock_producto_id` → **una config por cuenta** (si la misma cuenta sirve para
  varias plataformas, se crean varias filas de stock con la misma casilla).
- `codigos_verificacion.cuerpo text`, `codigos_verificacion.recibido_at timestamptz`.
- RPC `get_imap_estado_pedidos(p_proveedor_id, p_compra_ids)` (lectura, para la
  tabla Pedidos — `get_pedidos_proveedor` quedó intacto) y
  `set_compras_imap_enabled(p_proveedor_id, p_compra_id, p_enabled)`
  (`security definer`, exige config IMAP previa para habilitar).

Pendiente / deuda conocida de esta fase:

- `PLATAFORMA_KEYWORDS` está hardcodeado en `imap-request-code.js`; si una
  plataforma no matchea su remitente real, ajustarlo ahí.
- El proveedor no puede "ocultar" el IMAP una vez habilitado por compra: el
  toggle es por compra, no global por cuenta.
- La tabla Compras tiene 19 columnas, 4 de ellas botones de acción
  (`ver_producto`, `comunicacion_proveedor`, `renovar`, `telefono_cliente`).
  Pendiente de decidir con PM/PO si se mueven al menú `···`.
- Purgar `codigos_verificacion` / `codigo_solicitudes` expirados (no hay cron).

Password y Vault (Fase 5 v2):

- El RPC de lectura devuelve también `imap_host`, `imap_port`, `imap_usuario`,
  `imap_ssl` para prefillear el diálogo. **Nunca** el password: vive en Vault y
  solo lo lee `imap-save-config` con `service_role`.
- `password` es **opcional** en el body de `imap-save-config`: si llega vacío,
  la función lee el secreto existente de Vault, reusa ese `password_vault_id` y
  hace el test de conexión con él. Permite cambiar solo la plataforma sin volver
  a teclear la contraseña.
- **Purga de secretos huérfanos:** al guardar con password nueva, después del
  upsert se llama `vault.delete_secret(previousVaultId)`. Se intenta con y sin
  `ignore_if_missing` porque la firma cambió entre versiones de
  `supabase_vault`; si falla, solo se loguea un warning (nunca tumba el
  guardado). Aplicado antes de que existiera data en las tablas.
