# Migración a Supabase Auth

> **Estado:** propuesta para discusión de equipo. Nada implementado.
> **Objetivo de la reunión:** acordar los puntos abiertos de la sección 6 y decidir si arrancamos.

---

## 1. Contexto

Hoy la autenticación no usa Supabase Auth. `src/lib/supabase.ts` configura el cliente
(`autoRefreshToken`, `persistSession`) pero **nadie llama a `supabase.auth.*`**. El flujo real es:

- `signIn` en `src/stores/authStore.ts` hace `select` sobre `usuarios` por `usuario` y compara
  `userData.password !== password` — **texto plano, en el navegador**.
- La sesión es `localStorage.setItem('currentUserId', userData.id)`. No expira nunca.
- `requireRole` valida el rol contra ese store del cliente.

Es decir: el password viaja a Supabase, vuelve, y se compara en el cliente. Cualquiera con
DevTools abiertos ve la contraseña de todos los que se registran.

---

## 2. Datos medidos (ayer, contra producción)

| Métrica | Valor | Nota |
|---|---|---|
| Usuarios totales | **256** | `content-range: 0-255/256` |
| Password vacía | **0** | |
| Password < 7 caracteres | **0** | |
| Emails duplicados | **0** | Auth exige email único |
| Sin email | **0** | |
| Con referido (`referido_id`) | 10 | |
| Deshabilitados (`estado_habilitado = false`) | 5 | |
| Roles | 235 seller, 18 registered, 2 provider, 1 admin | |

**FKs que apuntan a `usuarios.id`: 7**

```
billeteras_usuario_id_fkey        usuarios_referido_id_fkey
recargas_usuario_id_fkey          compras_proveedor_id_fkey
retiros_usuario_id_fkey           stock_productos_proveedor_id_fkey
productos_proveedor_id_fkey
```

Cero passwords vacías y cero emails duplicados **es la mejor noticia posible** para esta
migración. Es exactamente lo que la suele hacer fracasar.

---

## 3. Propuesta de arquitectura

### 3.1 La decisión que define el costo: compartir el ID

`auth.users.id = usuarios.id`. Mismo UUID en ambas tablas.

Si en cambio dejamos que Auth genere UUIDs nuevos, hay que reescribir **7 FKs** sobre 256
filas, incluyendo el autorreferente de `usuarios.referido_id` (que es un árbol: si no se
reescribe bien, se rompe la cadena de referidos).

Con el ID compartido: **cero trabajo de datos.** Auth queda como una capa de identidad
encima de `usuarios`, y `usuarios` sigue siendo la tabla de perfil con `rol`,
`estado_habilitado`, `codigo_referido` y `billetera_id`.

**No creamos una tabla `profiles`.** No hace falta y agrega una capa que después nadie mantiene.

### 3.2 Cómo entran los passwords

Auth espera bcrypt. Hoy están en texto plano.

El script de migración hashea con bcrypt (cost 10-12) e inserta en `auth.users` con
`encrypted_password = crypt(password, gen_salt('bf'))`, preservando el `id`.

⚠️ **Es one-shot e irreversible.** Una vez hasheado, el plaintext desaparece. Si el script
tiene un bug, no hay vuelta atrás salvo que el equipo haya guardado un dump previo.
**Por eso la Fase 3 (vaciar la columna) está separada de las Fases 1-2.**

Reglas del script:

- Nunca loguear passwords, ni en errores ni en el progreso.
- Correr con `service_role`, nunca con la anon key.
- Crear los 5 deshabilitados también, con flag para rechazarlos post-login.
- Los 10 con referido no se tocan: su `referido_id` sigue apuntando igual.

---

## 4. Fases

Cada fase es independiente y reversible por separado.

### Fase 1 — Crear los 256 en `auth.users` (reversible)
- Script de migración, `id = usuarios.id`.
- **El login viejo sigue funcionando. Riesgo cero para el usuario.**
- Verificación: las 256 filas existen, 0 emails duplicados, conteo cuadra.

### Fase 2 — `signIn` contra Auth con fallback (reversible)
- Se intenta Auth; si falla, se cae al plaintext.
- **Dos semanas de convivencia.**
- Se mide el % de accesos que van por la nueva ruta. Cuando sea ~100%, seguimos.

### Fase 3 — Vaciar `password` (irreversible) ⚠️
```sql
update usuarios set password = '' where id is not null;
```
**Este es el paso que cierra la fuga.** Hasta acá, los passwords siguen en texto plano en la
base. Después, un dump de la base no entrega 256 credenciales.

### Fase 4 — Borrar código viejo
- `signIn` plaintext, comparaciones, columnas del schema.

---

## 5. Riesgos

### 5.1 Todo el código pasa a depender de timing
Hoy la sesión es síncrona. Con Auth, `getSession()` es **async**. Eso toca `initializeAuth()`
en `main.tsx`, los route guards y `refreshUser()`. Es el trabajo real, no la parte de passwords.

Mitigación: `refreshUser()` conserva la firma síncrona y espera la sesión internamente, así los
guards no cambian.

### 5.2 RLS: la deuda oculta
Verifiqué que la anon key puede **leer las 256 filas de `usuarios`**. Al activar Auth, si no
definimos policies, o rompe la app o queda igual de abierta.

Mínimo necesario:
- Cada usuario lee su propia fila
- Admins leen todas
- Productos y categorías siguen públicos

⚠️ **No hay ningún `.sql` en el repo.** Las policies existen en el dashboard de Supabase y no
las tenemos versionadas. Hay que recuperarlas antes de tocar nada.

### 5.3 Service role
`service_role` es el primer secret real que agregamos al proyecto. Pasa por revisión de
seguridad.

---

## 6. Puntos abiertos — para decidir en la reunión

1. **¿Doble sesión durante la transición o corte directo?**
   Recomiendo convivencia 2 semanas. Costo: dos rutas de login que mantener.

2. **¿Migración silenciosa o reset obligatorio de contraseñas?**
   Silenciosa es más suave para el usuario pero no tiene red de seguridad: si el hasheo falla,
   el usuario queda afuera sin recuperación posible. Reset obligatorio es más seguro pero
   genera soporte. **Con 256 usuarios y 18 `registered` que ni sabemos qué son, el reset
   selectivo puede ser viable.**

3. **¿Qué puede ver cada rol?** Decisión de producto, no técnica. Si `registered` no debe ver
   nada, hay que definirlo antes de escribir las policies.

4. **¿Podemos pedir `service_role`?** Si security no lo aprueba, la Fase 1 se hace por SQL
   manual en el dashboard y perdemos reproducibilidad.

5. **¿Guardamos un dump de `usuarios` antes de la Fase 3?** Yo digo que sí, siempre. Pero
   implica guardar 256 passwords en texto plano en algún lado, así que también es una decisión
   de seguridad.

6. **Los 18 `registered`, ¿qué son?** Nobody del equipo parece saberlo. Si son cuentas de
   prueba o abandonadas, se pueden excluir de la migración y evitar 18 invitaciones de
   reset que nadie va a atender.

7. **¿Quiénes son los 5 deshabilitados y qué pasa con ellos en Auth?**
   Auth permite el login y el bloqueo va aparte. Definimos si se migran o se dejan afuera.

---

## 7. Qué desbloquea esta migración

Resuelve de una vez cuatro problemas que hoy están abiertos:

| Problema | Estado | Lo resuelve Auth |
|---|---|---|
| Passwords en texto plano | abierto | ✅ Fase 3 |
| `rol` falsificable con curl | abierto | ✅ `app_metadata` solo editable por service_role |
| Sesión sin expiración | abierto | ✅ Refresh token |
| RLS ausente | abierto | ✅ Base de policies |

El segundo punto es relevante: el `rol: 'seller'` que pineamos en `api/sign-up.ts` hoy es solo
client-side. Con `signUp` no se puede setear `app_metadata.role` sin service_role, así que
pasa a ser real.

---

## 8. Alternativa considerada y descartada

**Migrar el INSERT de `usuarios` a una RPC `security definer`.** Resolvería el rol falsificable
y permitiría volver a aplicar la validación de `signup_mode` en la base, hoy solo client-side.
Pero requiere escribir SQL y revisar policies, así que conviene **después** de Auth, cuando ya
exista el esqueleto. Anotado como deuda técnica.