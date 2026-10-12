# Plan IMAP Automation Feature

> Objetivo: que "Obtener código" deje de usar mock y obtenga códigos reales de
> verificación leyendo el correo de la cuenta (vía IMAP), empezando por la
> configuración IMAP (diálogo "Configurar IMAP"). Backend: Supabase.

## 0. Estado actual (frontend)

- `compras-codigo-dialog.tsx`: mock (`MOCK_CODE = '482913'` + `setTimeout` 2s).
- `compras-imap-dialog.tsx`: formulario UI-only (email, host, port, usuario,
  password, ssl, carpeta). Al guardar solo hace `toast`, no persiste nada.
- Columna `actions` (oculta por defecto) abre ambos diálogos vía
  `ComprasContext` (`obtener_codigo` / `config_imap`).
- El frontend habla con Supabase directo (`src/lib/supabase.ts`,
  `supabase.from(...)`), sin Edge Functions existentes en el repo.

## 1. Decisión de arquitectura (importante)

**IMAP no puede correr en el navegador ni en una Supabase Edge Function.**

- El navegador no permite sockets TCP crudos (IMAP es TCP: puertos 143/993).
- Las Supabase Edge Functions (runtime Deno) solo permiten salida vía `fetch`;
  no hay `Deno.connect` TCP. **No se puede usar `imapflow`/`node-imap` ahí.**
- Las credenciales IMAP **nunca** deben guardarse ni usarse en el cliente.

Arquitectura recomendada:

```
[Dialog Configurar IMAP] --(guarda config cifrada)--> Supabase (tabla imap_configs)
[Dialog Obtener código] --(invoca)--> Edge Function `imap-request-code`
        --> job en tabla `codigo_solicitudes`
[Worker IMAP externo] --(poll cada X seg)--> lee job --> conecta IMAP -->
        extrae código --> escribe `codigos_verificacion`
[Dialog Obtener código] --(Realtime o polling)--> muestra código en InputOTP
```

Componentes:

1. **Tablas Supabase** (store + RLS).
2. **Edge Function `imap-request-code`** (Deno, solo `fetch` + `supabase-js`):
   valida usuario, crea la solicitud, opcionalmente llama al worker (webhook).
3. **Worker IMAP externo** (servicio pequeño Node + `imapflow`, desplegado en
   Fly.io / Railway / Cloud Run / VPS): el único que toca IMAP y credenciales.
4. **Frontend**: conectar los dos diálogos existentes a este flujo.

Alternativa sin worker propio (solo si las cuentas son Gmail/Outlook):

- Usar **Gmail API** (`fetch` a `gmail.googleapis.com`) u **Outlook/Graph API**
  con OAuth2. Esto **sí** funciona dentro de una Edge Function porque es HTTPS.
  Requiere registrar OAuth app y guardar refresh tokens en Vault. Si las cuentas
  son de proveedores variados (cPanel, hosting propio), esta vía no sirve y se
  necesita el worker IMAP.

## 2. Paso 1 — Modelo de datos en Supabase

Crear migración SQL:

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

## 3. Paso 2 — Guardar credenciales con Supabase Vault

1. Activar extensión `supabase_vault` (Dashboard → Database → Extensions).
2. El password/app-password se guarda con `vault.create_secret()` desde la Edge
   Function (nunca desde el cliente).
3. `imap_configs.password_vault_id` guarda solo el id del secreto.
4. El worker lee el secreto con `service_role` y lo usa en memoria (nunca lo
   loguea ni lo devuelve al frontend).
5. Al listar configs al frontend, devolver `password: '••••'` (enmascarado).

## 4. Paso 3 — Edge Function `imap-request-code`

`supabase/functions/imap-request-code/index.ts` (Deno):

- Auth: verifica JWT del vendedor (`supabase.auth.getUser()`).
- Input: `{ compra_id }`. Resuelve `stock_producto_id` + `imap_configs`.
- Crea fila en `codigo_solicitudes` (`pendiente`).
- Dispara al worker (webhook con secreto compartido, o el worker hace poll de
  `pendiente` cada 10–15s — el poll es más simple y robusto).
- Responde `{ solicitud_id }`.
- Opcional: endpoint `imap-test-connection` que encola una solicitud tipo
  `test` para validar la config al guardar (el diálogo muestra "Verificando…").

## 5. Paso 4 — Worker IMAP externo

Servicio Node mínimo (ej. `worker-imap/` fuera del monorepo o carpeta aparte):

- Deps: `imapflow` (IMAP moderno), `@supabase/supabase-js` (con
  `service_role`), `jsdom` o regex para parsear HTML.
- Loop:
  1. `select pendiente más antigua` de `codigo_solicitudes` → marcar
     `procesando`.
  2. Leer `imap_configs` + secreto de Vault.
  3. Conectar IMAP (`imapflow`: host, port, `secure: ssl`, auth usuario/pass).
  4. Buscar en `carpeta`: `UNSEEN` de los últimos 10 min (o `SINCE`).
  5. Extraer código con regex (ej. `/\b\d{4,8}\b/`, ajustable por producto con
     columna opcional `codigo_regex` en `imap_configs`).
  6. Insertar en `codigos_verificacion`, marcar solicitud `listo` (o `error`).
  7. Marcar email como visto, cerrar conexión.
- Timeout por job (~25s), reintentos máx. 3, backoff.
- Despliegue: Fly.io/Railway/Render con `SERVICE_ROLE_KEY` y
  `WORKER_SECRET` como env vars. Un cron interno o `setInterval`.
- Seguridad: sin endpoints públicos salvo `/health`; si hay webhook, validar
  `WORKER_SECRET`.

## 6. Paso 5 — Conectar el frontend existente

`src/features/vendedor/compras/`:

1. **Services** (`services/imap.ts`, siguiendo el patrón de `services/index.ts`):
   - `saveImapConfig(stockProductoId, values)` → invoca Edge Function
     `imap-save-config` (o inserta config sin password + envía password a la
     Edge Function para Vault).
   - `requestCode(compraId)` → invoca `imap-request-code`, retorna
     `solicitud_id`.
   - `getLatestCode(solicitudId)` → lee `codigos_verificacion`.
2. **Queries** (`queries/index.ts`): `useSaveImapConfig` (mutation),
   `useRequestCode` (mutation), `useCodigoVerificacion(solicitudId)` (query con
   `refetchInterval: 3000` hasta `listo`, o suscripción Realtime a
   `codigos_verificacion` filtrada por `solicitud_id`).
3. **Diálogos**:
   - `compras-imap-dialog.tsx`: `onSubmit` → `useSaveImapConfig`; estado
     "Verificando conexión…" (solicitud `test`); toast éxito/error reales.
   - `compras-codigo-dialog.tsx`: al abrir → `requestCode(compra.id)`; mientras
     `pendiente/procesando` muestra loader (reemplaza el `setTimeout` mock);
     al llegar el código lo pone en el `InputOTP` (readOnly + botón copiar);
     timeout UX a los ~45s con "Reintentar".
4. **Schema**: extender `compraSchema` si se necesita (`stock_producto_id` ya
   existe; agregar `imap_configurada?: boolean` para badge en la tabla).

## 7. Paso 6 — Seguridad (checklist)

- [ ] RLS activado en las 3 tablas; cliente nunca usa `service_role`.
- [ ] Passwords solo en Vault; frontend jamás recibe secretos en claro.
- [ ] Validar en la Edge Function que el vendedor es dueño de la compra.
- [ ] Rate limit: máx. N solicitudes por compra/hora (columna o chequeo en la
      función) para no quemar las cuentas IMAP.
- [ ] Logs del worker sin credenciales ni códigos completos (enmascarar).
- [ ] `expira_at` en códigos (ej. 10 min) y limpieza periódica.

## 8. Fases de entrega sugeridas

1. **Fase 1 — Persistencia**: migración + Vault + guardar config desde el
   diálogo (con test de conexión simulado `pendiente`).
2. **Fase 2 — Worker + extracción**: worker IMAP funcional en 1 proveedor
   (ej. Gmail con app-password), regex genérico.
3. **Fase 3 — Obtener código real**: Edge Function + Realtime/polling en el
   diálogo, retiro del mock.
4. **Fase 4 — Endurecer**: rate limit, `codigo_regex` por producto, reintentos,
   monitoreo (logs del worker + alerta si `error` > X%).

## 9. Qué NO hacer

- No conectar IMAP desde el frontend (imposible + expone credenciales).
- No guardar passwords en claro en ninguna tabla.
- No usar la `anon key` ni `service_role` en el cliente para estas tablas.
- No asumir un formato único de código: cada servicio (Netflix, Disney, etc.)
  envía remitentes/asuntos distintos → regex configurable por producto.
