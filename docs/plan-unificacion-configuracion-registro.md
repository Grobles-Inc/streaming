# Plan: Unificar configuración (comisiones/QR/recarga) con ajustes de registro

## Contexto actual

El proyecto tiene **dos estrategias conviviendo** sobre la misma tabla `public.configuracion`:

1. **Comisiones, tasa de conversión, publicación y ahora QR/Yape/Binance**
   - Servicio: `src/features/admin/configuracion-sistema/services/configuracion.service.ts`
   - Lectura: `getLatestConfiguracion` -> `order('updated_at', desc).limit(1)`
   - Escritura: `saveConfiguracion` -> `insert` de una **nueva fila** (historial/versionado).
   - Restauración: `restaurarConfiguracion` inserta una nueva fila con valores anteriores.
   - Lectura vendedor: `src/features/vendedor/recargas/services/index.ts` `getConfiguracionActual` -> misma estrategia `updated_at desc limit 1`.

2. **Registro de usuarios (`signup_mode`, `registro_requiere_aprobacion`)**
   - Lectura/escritura: `src/features/auth/api/signup-settings.ts` -> `getSignupSettings`/`updateSignupSettings`
   - Acceso: `ConfigurationService` en `src/services/configuration.service.ts`
   - Estrategia: fila fija `id = '1'` (`eq('id', '1')`), upsert sin tocar `updated_at`.
   - Intención explícita (ver comentarios): evitar promover la fila `1` a "vigente" y revertir comisiones guardadas por el admin.

## Problema / deuda

- Dos fuentes de verdad para la misma tabla con criterios distintos (`updated_at` vs `id = '1'`).
- Si se intenta leer todo desde la fila más reciente, los switches de registro pueden aparecer `null`/default y cambiar comportamiento (`fallback 'invite'`).
- `MappedConfiguracion` del feature admin no incluye todos los campos de la tabla (por ejemplo `signup_mode`, `registro_requiere_aprobacion`, `register_link`, y ahora `yape_info`/`binance_info` parcialmente tipados aparte), por lo que el modelo está fragmentado.

## Objetivo propuesto

Unificar para que exista una única fila vigente por `updated_at`, manteniendo el historial/versionado para comisiones cuando aplique, y que registro se lea/escriba sobre esa misma fila vigente.

## Opciones a discutir

### Opción A — Unificación completa (historial versionado para todo)

- Modificar `signup-settings` para leer la fila más reciente (`updated_at desc limit 1`).
- Al guardar ajustes de registro, **insertar una nueva fila** que copie todos los valores actuales (comisiones, conversión, QR/yape/binance) más los nuevos switches.
- Ajustar `MappedConfiguracion` para incluir `signup_mode`, `registro_requiere_aprobacion`, `register_link`.
- Backfill: copiar `signup_mode` y `registro_requiere_aprobacion` de `id = '1'` a la fila más reciente.

**Ventajas:** consistente, auditable y alineado con historial.  
**Riesgos:** mayor complejidad, más filas, cache de signup más invalidaciones, y migración crítica.

### Opción B — Fila vigente única mutable (sin versionado de admin)

- Una sola fila `configuracion` con `id = 1` (o fila activa marcada), y admin muta esa misma fila.
- `HistorialConfiguracionCard` deja de usar la tabla o se mueve a una tabla separada de historial.

**Ventajas:** simplicidad conceptual, una fuente de verdad.  
**Riesgos:** se pierde/versionado existente y hay que refactorizar historial y restore.

### Opción C — Mantener separación (estado actual)

- Comisiones/recarga siguen por `updated_at`.
- Registro sigue en `id = 1`.
- Documentar explícitamente la separación (este archivo).

**Ventajas:** bajo riesgo, ya estable.  
**Riesgos:** deuda técnica y confusión operativa.

## Backfill / migración (aplica para A/B)

- Copiar de `id = '1'` a la fila vigente:
  - `signup_mode`
  - `registro_requiere_aprobacion`
  - `register_link`
- Verificar que `updated_at` quede consistente (no revertir por `updated_at` más nuevo).
- Mantener `id = '1'` temporalmente como respaldo hasta validar en prod.

## Contratos / código a tocar (si se aprueba A)

- `src/features/auth/api/signup-settings.ts`
  - `getSignupSettings`: latest row.
  - `updateSignupSettings`: insert completo o update latest.
- `src/services/configuration.service.ts`
  - Reemplazar `eq('id','1')` por latest o mutar latest.
- `src/features/admin/configuracion-sistema`
  - Incluir switches de registro en `handleSaveAll` si se unifica.
  - `MappedConfiguracion`: agregar campos de registro.
- `src/hooks/use-configuracion.ts`
  - Sincronizar nuevos campos y recargar historial.
- `src/features/proveedor/...` (si consumen registro; revisar impacto).

## Testing / criterios de aceptación

- Guardar comisiones no altera `signup_mode`.
- Guardar signup no altera comisiones ni QR/yape/binance.
- Al cambiar de fila más reciente, signup refleja el valor guardado.
- Historial/restaurar mantiene ambos grupos de campos.
- Smoke: `/sign-up` con modos `open/invite/closed` y aprobación requerida.

## Riesgos

- Regresión de registro si falla backfill (fallback `invite`).
- Pérdida de historial si se usan upserts erróneos.
- Concurrencia si dos admins guardan a la vez (insert paralelo).

## Estimación (aprox.)

- Opción A: medio-alto (refactor + migración + pruebas).
- Opción B: alto (cambia arquitectura).
- Opción C: ninguna.

## Decisión recomendada hoy

Mantener Opción C. Si en la reunion se aprueba unificar, comenzar por **Opción A controlada** con backfill y pruebas de smoke antes de desplegar.