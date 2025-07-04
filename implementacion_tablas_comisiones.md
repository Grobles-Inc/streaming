# Implementación de Tablas de Comisiones en Mi Billetera

## Resumen

Se ha implementado un sistema completo de seguimiento y visualización de comisiones para el administrador dentro del módulo "Mi Billetera". Este sistema incluye tres tipos de tablas especializadas para mostrar las ganancias por comisiones del administrador.

## Funcionalidades Implementadas

### 1. **Tabla de Comisiones por Publicación de Productos**

#### Descripción
Muestra las comisiones generadas cuando un producto cambia de estado "borrador" a "publicado". El administrador recibe una comisión basada en el precio público del producto y el porcentaje configurado en la tabla `configuracion`.

#### Características
- **Origen de datos**: Tabla `productos` filtrada por `estado = 'publicado'`
- **Comisión**: Basada en `comision_publicacion_producto` de la tabla `configuracion`
- **Cálculo**: `precio_publico * (comision_publicacion_producto / 100)`
- **Fecha de referencia**: `updated_at` del producto cuando cambió a estado "publicado"

#### Columnas mostradas
- Producto (nombre y precio público)
- Proveedor (nombre, apellidos, usuario)
- Comisión (monto y porcentaje)
- Fecha de publicación
- Estado (siempre "Publicado")
- Acciones (ver detalles)

### 2. **Tabla de Comisiones por Retiros**

#### Descripción
Muestra las comisiones generadas cuando un usuario (excepto el administrador) realiza un retiro de fondos de su billetera. La comisión se calcula como un porcentaje del monto retirado.

#### Características
- **Origen de datos**: Tabla `retiros` excluyendo usuarios con `rol = 'admin'`
- **Comisión**: Basada en `comision` de la tabla `configuracion`
- **Cálculo**: `monto_retiro * (comision / 100)`
- **Fecha de referencia**: `created_at` del retiro

#### Columnas mostradas
- Usuario (nombre, apellidos, usuario)
- Monto del retiro
- Comisión (monto y porcentaje)
- Fecha del retiro
- ID del retiro (primeros 8 caracteres)
- Acciones (ver detalles)

### 3. **Tabla General de Comisiones**

#### Descripción
Combina todas las comisiones (publicaciones y retiros) en una vista unificada, permitiendo ver el flujo completo de ingresos del administrador.

#### Características
- **Datos combinados**: Comisiones de publicación + comisiones de retiro
- **Ordenamiento**: Por fecha más reciente
- **Filtros**: Por tipo, fechas, usuario, producto

#### Columnas mostradas
- Tipo (Publicación/Retiro con iconos distintivos)
- Usuario involucrado
- Descripción de la transacción
- Monto base de la transacción
- Comisión generada (monto y porcentaje)
- Fecha de la transacción
- Acciones (ver detalles)

## Configuración Dinámica de Comisiones

### Sistema de Configuración Histórica
El sistema considera la configuración vigente al momento de cada transacción:

1. **Para Publicaciones**: Usa la configuración válida cuando el producto fue publicado
2. **Para Retiros**: Usa la configuración válida cuando se realizó el retiro

### Ejemplo de Cálculo
```typescript
// Producto publicado el 1 de enero con comisión del 5%
producto.precio_publico = 100
configuracion.comision_publicacion_producto = 5
comision = 100 * (5 / 100) = $5.00

// Retiro realizado el 15 de enero con comisión del 3%
retiro.monto = 200
configuracion.comision = 3
comision = 200 * (3 / 100) = $6.00
```

## Estadísticas y Métricas

### Panel de Estadísticas
Se incluye un panel con métricas clave:

- **Total de comisiones**: Suma de todas las comisiones
- **Comisiones por publicación**: Total de publicaciones
- **Comisiones por retiro**: Total de retiros
- **Promedio general**: Promedio por transacción
- **Distribución porcentual**: Gráficos de distribución

### Cálculos
```typescript
interface EstadisticasComisiones {
  totalComisionesPublicacion: number    // Suma de comisiones por publicación
  totalComisionesRetiro: number         // Suma de comisiones por retiro
  totalComisiones: number               // Total general
  cantidadPublicaciones: number         // Número de productos publicados
  cantidadRetiros: number               // Número de retiros procesados
  promedioComisionPublicacion: number   // Promedio por publicación
  promedioComisionRetiro: number        // Promedio por retiro
}
```

## Sistema de Filtros

### Filtros Disponibles
1. **Por tipo**: Todos, Solo publicaciones, Solo retiros
2. **Por fechas**: Fecha inicio y fin (con validaciones)
3. **Por usuario**: Búsqueda por nombre de usuario
4. **Por producto**: Búsqueda por nombre de producto (solo para publicaciones)

### Filtros Rápidos
- Últimos 30 días
- Este mes
- Solo publicaciones
- Solo retiros

### Validaciones
- Fecha fin no puede ser anterior a fecha inicio
- Fechas no pueden ser futuras
- Los filtros se aplican en tiempo real

## Estructura de Archivos

### Servicios
```
src/features/admin/mi-billetera/services/
├── comisiones.service.ts          # Lógica de negocio para comisiones
└── index.ts                       # Exportaciones del módulo
```

### Tipos de Datos
```
src/features/admin/mi-billetera/data/
├── types.ts                       # Interfaces y tipos TypeScript
└── index.ts                       # Exportaciones de tipos
```

### Componentes
```
src/features/admin/mi-billetera/components/
├── comisiones-content.tsx         # Componente principal con tabs
├── comisiones-stats.tsx           # Panel de estadísticas
├── comisiones-filtros.tsx         # Sistema de filtros
├── comisiones-publicacion-table.tsx    # Tabla de comisiones de publicación
├── comisiones-retiro-table.tsx          # Tabla de comisiones de retiro
├── comisiones-generales-table.tsx       # Tabla general combinada
├── comisiones-publicacion-columns.tsx   # Definición de columnas para publicación
├── comisiones-retiro-columns.tsx        # Definición de columnas para retiro
├── comisiones-generales-columns.tsx     # Definición de columnas generales
└── mi-billetera-content.tsx       # Componente principal actualizado
```

## Integración con Mi Billetera

### Nueva Tab de Comisiones
Se agregó una tercera tab al módulo existente:
- **Recargas**: Gestión de recargas de billetera
- **Retiros**: Gestión de retiros de billetera
- **Comisiones**: Nuevo sistema de comisiones (solo para administradores)

### Control de Acceso
- Solo usuarios con rol `admin` pueden ver las comisiones
- El sistema filtra automáticamente las comisiones del propio administrador en retiros

## Funcionalidades Adicionales

### Modales de Detalle
Cada tipo de comisión tiene su modal específico con información detallada:

1. **Modal de Publicación**: Producto, proveedor, fechas, cálculos
2. **Modal de Retiro**: Usuario, monto, fechas, ID de retiro
3. **Modal General**: Información adaptada según el tipo

### Exportación de Datos
- Botón de exportación preparado para futuras implementaciones
- Estructura lista para CSV/Excel

### Actualizaciones en Tiempo Real
- Botón de actualización manual
- Recarga automática al cambiar filtros
- Estados de carga consistentes

## Consultas SQL Optimizadas

### Query para Comisiones de Publicación
```sql
SELECT 
  productos.id,
  productos.nombre,
  productos.precio_publico,
  productos.estado,
  productos.proveedor_id,
  productos.updated_at,
  usuarios.nombres,
  usuarios.apellidos,
  usuarios.usuario
FROM productos
JOIN usuarios ON productos.proveedor_id = usuarios.id
WHERE productos.estado = 'publicado'
ORDER BY productos.updated_at DESC;
```

### Query para Comisiones de Retiro
```sql
SELECT 
  retiros.id,
  retiros.usuario_id,
  retiros.monto,
  retiros.estado,
  retiros.created_at,
  usuarios.nombres,
  usuarios.apellidos,
  usuarios.usuario,
  usuarios.rol
FROM retiros
JOIN usuarios ON retiros.usuario_id = usuarios.id
WHERE usuarios.rol != 'admin' AND retiros.estado = 'aprobado'
ORDER BY retiros.created_at DESC;
```

## Consideraciones Técnicas

### Performance
- Uso de React Query para caché de datos
- Paginación en tablas para grandes volúmenes
- Filtros aplicados a nivel de base de datos

### Manejo de Errores
- Try-catch en todas las operaciones async
- Mensajes de error descriptivos
- Estados de carga consistentes

### Accesibilidad
- Labels apropiados en formularios
- Navegación por teclado en tablas
- Contrastes de color adecuados

### Responsive Design
- Tablas adaptables a móviles
- Filtros colapsables en pantallas pequeñas
- Grid responsive para estadísticas

## Posibles Mejoras Futuras

1. **Exportación Real**: Implementar CSV/Excel
2. **Gráficos**: Charts para visualizar tendencias
3. **Notificaciones**: Alertas de nuevas comisiones
4. **Automatización**: Cálculo automático en tiempo real
5. **Reportes**: Generación de reportes periódicos
6. **API**: Endpoints dedicados para móvil

---

**Fecha de implementación**: 4 de julio de 2025
**Versión**: 1.0.0
**Estado**: ✅ Completado y funcional
