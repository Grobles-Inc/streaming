# Sistema de Configuración de la Aplicación

Este módulo implementa un sistema robusto de configuración conectado a Supabase que permite gestionar la configuración del sistema con historial completo y confirmaciones de seguridad.

## Características Principales

### ✅ **Configuración en Tiempo Real**
- Los valores mostrados siempre son los más recientes desde Supabase
- Actualización automática sin necesidad de recargar la página
- Sincronización bidireccional entre la UI y la base de datos

### ✅ **Historial Completo**
- Conserva todas las configuraciones anteriores
- Cada cambio crea una nueva fila (no actualiza la existente)
- Permite restaurar configuraciones anteriores
- Vista de tabla con fechas, valores y acciones

### ✅ **Modo Mantenimiento con Confirmación**
- Modal de confirmación antes de activar/desactivar mantenimiento
- Guardado automático al cambiar el estado de mantenimiento
- Indicadores visuales del estado actual

### ✅ **Validación y Manejo de Errores**
- Manejo robusto de errores de conexión a Supabase
- Notificaciones toast para feedback del usuario
- Estados de carga y guardado

## Estructura de Archivos

```
src/features/admin/configuracion-sistema/
├── configuracion-sistema-page.tsx    # Página principal
├── components/
│   ├── mantenimiento-confirm-dialog.tsx  # Modal de confirmación para mantenimiento
│   └── historial-configuracion.tsx       # Tabla de historial
├── hooks/
│   └── use-configuracion.ts              # Hook personalizado para lógica de estado
├── services/
│   └── configuracion.service.ts          # Servicio para operaciones con Supabase
├── data/
│   └── types.ts                          # Tipos TypeScript
└── index.ts                              # Exportaciones principales
```

## Configuraciones Disponibles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `mantenimiento` | `boolean` | Activa/desactiva el modo mantenimiento |
| `email_soporte` | `string` | Email de contacto para soporte |
| `comision` | `number` | Porcentaje de comisión global (0-100) |
| `conversion` | `number` | Factor de conversión del sistema |

## Cómo Usar

### 1. Acceder a la Configuración
```typescript
import { useConfiguracion } from './hooks/use-configuracion'

const { configuracion, loading, saving, saveConfiguracion } = useConfiguracion()
```

### 2. Guardar Nueva Configuración
```typescript
const success = await saveConfiguracion({
  mantenimiento: true,
  email_soporte: 'nuevo@email.com',
  comision: 15,
  conversion: 1.2
})
```

### 3. Ver Historial
```typescript
const { loadHistorial, historial } = useConfiguracion()
await loadHistorial()
```

### 4. Restaurar Configuración Anterior
```typescript
const { restaurarConfiguracion } = useConfiguracion()
await restaurarConfiguracion('config-id-anterior')
```

## Comportamiento Especial

### Modo Mantenimiento
- **Requiere confirmación**: Al cambiar el estado se muestra un modal de confirmación
- **Guardado automático**: Una vez confirmado, se guarda inmediatamente
- **Indicadores visuales**: Badge rojo cuando está activo, indicadores en múltiples lugares

### Detección de Cambios
- **Badge "Cambios pendientes"**: Se muestra en el header cuando hay modificaciones sin guardar
- **Botones deshabilitados**: Los botones de guardar se deshabilitan cuando no hay cambios
- **Card de cambios pendientes**: Aparece una tarjeta naranja cuando hay cambios importantes

### Historial
- **Vista on-demand**: El historial solo se carga cuando se solicita explícitamente
- **Restauración**: Permite restaurar cualquier configuración anterior (crea nueva fila)
- **Badge "Actual"**: La configuración más reciente se marca claramente

## Base de Datos (Supabase)

### Tabla `configuracion`
```sql
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mantenimiento BOOLEAN DEFAULT false,
  email_soporte TEXT,
  comision NUMERIC DEFAULT 10,
  conversion NUMERIC DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Estrategia de Historial
- **No se actualizan filas existentes**: Cada cambio inserta una nueva fila
- **Ordenado por fecha**: `updated_at` determina qué configuración es la más reciente
- **ID único**: Cada configuración tiene su propio UUID

## Notificaciones

El sistema utiliza `sonner` para mostrar notificaciones:
- ✅ **Éxito**: "Configuración guardada correctamente"
- ❌ **Error**: "Error al guardar la configuración"
- ✅ **Restauración**: "Configuración restaurada correctamente"

## Estados de la UI

- **Loading**: Skeleton mientras carga la configuración inicial
- **Saving**: Botones muestran "Guardando..." y se deshabilitan
- **Error**: Se muestra mensaje de error debajo del título
- **Changes**: Indicadores visuales de cambios pendientes

## Seguridad y Validación

- **Validación de tipos**: TypeScript strict para todos los valores
- **Límites numéricos**: Comisión 0-100%, conversión ≥ 0
- **Manejo de nulos**: email_soporte puede ser null
- **Confirmación crítica**: Modal obligatorio para modo mantenimiento
