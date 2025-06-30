# Correcciones del Saldo de Usuarios

## Problema Identificado
El saldo de los usuarios no se mostraba en la columna "Saldo" de la tabla de usuarios porque:

1. **Estructura de Base de Datos**: El saldo real está en la tabla `billeteras` con el campo `saldo`, no en `usuarios.balance`
2. **Relación**: La tabla `billeteras` se relaciona con `usuarios` mediante `billeteras.usuario_id = usuarios.id`
3. **JOIN Incorrecto**: Los queries no estaban haciendo el JOIN correctamente para obtener el saldo

## Cambios Realizados

### 1. Servicio de Usuarios (`users.service.ts`)
- ✅ Corregido el JOIN entre `usuarios` y `billeteras` usando la foreign key correcta
- ✅ Actualizado todos los métodos para incluir el saldo de billetera:
  - `getUsers()` - Obtener todos los usuarios con saldo
  - `getUserById()` - Obtener usuario específico con saldo  
  - `searchUsersByName()` - Búsqueda por nombre con saldo
  - `filterByRole()` - Filtro por rol con saldo
- ✅ Sintaxis del JOIN corregida: `billeteras!billeteras_usuario_id_fkey`

### 2. Hook de Usuarios (`use-users.ts`)
- ✅ Corregido el mapeo de usuarios después de crear/actualizar
- ✅ Los métodos `createUser`, `updateUser` y `updateUserBalance` ahora recargan el usuario completo con billetera
- ✅ Eliminada la función `searchUsersByEmail` que no existe

### 3. Contexto de Usuarios (`users-context-new.tsx`)
- ✅ Eliminada la referencia a `searchUsersByEmail`
- ✅ Actualizado para usar el nuevo contexto que incluye el saldo de billetera

### 4. Componentes de Usuario
- ✅ **Columnas** (`users-columns.tsx`): Eliminada columna `referido_id` que no existe
- ✅ **Formulario** (`users-action-dialog.tsx`): Eliminado campo `referido_id` del formulario
- ✅ **Índice** (`index.tsx`): Cambiado a usar el nuevo contexto

### 5. Esquema de Datos (`schema.ts`) 
- ✅ Tipo `UserWithWallet` incluye `saldo_billetera` y `billetera_id`
- ✅ Función `mapSupabaseUserToComponent` usa `saldo_billetera` como fuente del saldo

## Estructura de Datos Actualizada

```typescript
// Usuario de Supabase con billetera
type SupabaseUserWithWallet = SupabaseUser & {
  saldo_billetera: number | null  // Saldo real desde billeteras.saldo
  billetera_id: string | null     // ID de la billetera
}

// Usuario mapeado para el componente
type MappedUser = {
  id: string
  nombres: string
  apellidos: string
  telefono: string | null
  rol: 'admin' | 'provider' | 'seller'
  email: string
  avatar: string
  saldo: number                   // Mapeado desde saldo_billetera
  billetera_id: string | null
  fechaCreacion: Date
  fechaActualizacion: Date
}
```

## Query de Ejemplo

```sql
-- Query que se ejecuta ahora para obtener usuarios con saldo
SELECT 
  usuarios.*,
  billeteras.id as billetera_id,
  billeteras.saldo as saldo_billetera
FROM usuarios
LEFT JOIN billeteras ON billeteras.usuario_id = usuarios.id
ORDER BY usuarios.created_at DESC;
```

## Estado Actual

✅ **Compilación**: Sin errores de TypeScript en el módulo de usuarios
✅ **Servidor**: Funcionando correctamente en puerto 5174
✅ **JOIN**: Configurado correctamente para obtener saldo desde billeteras
✅ **Mapeo**: Los datos se mapean correctamente del saldo de billetera al campo saldo del componente
✅ **UI**: Columna "Saldo" configurada para mostrar el valor con formato de moneda

## Siguiente Paso

Necesita probarse en la interfaz navegando a `/admin/users` para verificar que:
1. Los usuarios se cargan correctamente
2. La columna "Saldo" muestra los valores desde la tabla `billeteras`
3. El saldo se actualiza correctamente al crear/editar usuarios
4. Las búsquedas y filtros funcionan manteniendo el saldo

## Archivos Modificados

### Servicios y Hooks
- `src/features/users/services/users.service.ts` - ✅ JOIN corregido con billeteras
- `src/features/users/hooks/use-users.ts` - ✅ Mapeo corregido para recargar usuarios con billetera

### Contexto
- `src/features/users/context/users-context-new.tsx` - ✅ Contexto limpio sin searchUsersByEmail
- `src/features/users/index.tsx` - ✅ Cambiado a usar nuevo contexto

### Componentes
- `src/features/users/components/users-columns.tsx` - ✅ Eliminada columna referido_id
- `src/features/users/components/users-action-dialog.tsx` - ✅ Eliminado campo referido_id, contexto corregido
- `src/features/users/components/users-primary-buttons.tsx` - ✅ Contexto corregido
- `src/features/users/components/data-table-row-actions.tsx` - ✅ Contexto corregido
- `src/features/users/components/users-dialogs.tsx` - ✅ Contexto corregido
- `src/features/users/components/users-delete-dialog.tsx` - ✅ Contexto corregido

### Esquemas
- `src/features/users/data/schema.ts` - ✅ Actualizado previamente con UserWithWallet
