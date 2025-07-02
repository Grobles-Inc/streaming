# Módulo de Gestión de Productos - Admin

## 📋 Descripción

Este módulo proporciona una interfaz completa de administración para la gestión de productos en el sistema. Incluye funcionalidades CRUD completas (Crear, Leer, Actualizar, Eliminar) y operaciones avanzadas.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **📊 Vista de Dashboard**: Estadísticas y resumen de productos
- **📝 CRUD Completo**: 
  - ➕ Crear nuevos productos
  - 👁️ Ver detalles de productos
  - ✏️ Editar productos existentes
  - 🗑️ Eliminar productos
- **🔄 Operaciones Avanzadas**:
  - 📋 Duplicar productos
  - 🔄 Cambiar estado (Publicado/Borrador)
  - 📦 Operaciones masivas
- **🔍 Filtros y Búsqueda**:
  - 🔍 Búsqueda por nombre
  - 🏷️ Filtro por categoría, proveedor, estado
  - 👁️ Control de visibilidad de columnas
- **📊 Tabla Interactiva**:
  - ✅ Selección múltiple
  - 📄 Paginación
  - 🔤 Ordenamiento
  - 📱 Responsive

### 🎨 Interface de Usuario

- **📊 Cards de estadísticas** con métricas importantes
- **📋 Tabla completa** con todas las columnas relevantes
- **🔄 Modales** para crear, editar y ver detalles
- **🎛️ Controles avanzados** para operaciones masivas
- **🎨 UI moderna** con componentes de shadcn/ui

## 📁 Estructura de Archivos

```
src/features/admin/productos/
├── 📄 productos-page.tsx           # Página principal
├── 📄 index.ts                     # Exportaciones
├── 📁 components/
│   ├── 📄 productos-table.tsx      # Tabla principal
│   ├── 📄 productos-columns.tsx    # Definición de columnas
│   ├── 📄 producto-form.tsx        # Formulario crear/editar
│   ├── 📄 producto-form-modal.tsx  # Modal del formulario
│   └── 📄 producto-details-modal.tsx # Modal de detalles
├── 📁 data/
│   ├── 📄 types.ts                 # Tipos TypeScript
│   └── 📄 schema.ts                # Esquemas Zod
├── 📁 hooks/
│   └── 📄 use-productos.ts         # Hook personalizado
└── 📁 services/
    └── 📄 productos.service.ts     # Servicio API
```

## 🛠️ Tecnologías Utilizadas

- **React** + **TypeScript** - Base del proyecto
- **TanStack Table** - Tabla avanzada con filtros y paginación
- **React Hook Form** + **Zod** - Manejo de formularios y validación
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Iconos
- **Supabase** - Base de datos y API

## 🔧 Uso

### Acceso al Módulo

1. Iniciar sesión como administrador
2. Navegar a **Admin > Gestión de Productos** en el sidebar
3. La página principal mostrará el dashboard de productos

### Operaciones Disponibles

#### ➕ Crear Producto
- Clic en "Agregar producto"
- Completar formulario con información requerida
- Configurar precios, categoría, y opciones avanzadas
- Subir imagen (opcional)

#### 👁️ Ver Detalles
- Clic en el ícono de ojo en la tabla
- Se abre modal con información completa del producto

#### ✏️ Editar Producto
- Clic en "Editar" en el menú de acciones
- Modificar campos necesarios
- Guardar cambios

#### 🗑️ Eliminar
- Individual: Menú de acciones > Eliminar
- Masivo: Seleccionar productos > Botón "Eliminar"

#### 🔄 Cambiar Estado
- Individual: Menú de acciones > Publicar/Borrador
- Masivo: Seleccionar productos > Botones de estado

### 🎛️ Controles de Tabla

- **🔍 Búsqueda**: Campo de búsqueda por nombre
- **👁️ Columnas**: Control de visibilidad de columnas
- **✅ Selección**: Checkbox para operaciones masivas
- **📄 Paginación**: Navegación entre páginas

## 📊 Campos del Producto

### Información Básica
- **Nombre**: Título del producto
- **Descripción**: Descripción corta
- **Descripción completa**: Descripción detallada
- **Categoría**: Clasificación del producto
- **Proveedor**: Usuario que suministra el producto

### Precios y Stock
- **Precio público**: Precio de venta al público
- **Precio vendedor**: Precio para vendedores
- **Precio renovación**: Precio para renovaciones (opcional)
- **Stock**: Cantidad disponible
- **Tiempo de uso**: Duración en días

### Configuración
- **Estado**: Borrador/Publicado
- **Disponibilidad**: En stock/A pedido/Activación
- **Etiquetas**: Nuevo, Destacado, Más vendido
- **Opciones**: Renovable, Mostrar stock, etc.

### Información Adicional
- **Información**: Detalles técnicos
- **Condiciones**: Términos y condiciones
- **Solicitud**: Información para procesamiento
- **Imagen**: URL de imagen del producto

## 🔄 Estados del Producto

- **📝 Borrador**: Producto en desarrollo, no visible públicamente
- **✅ Publicado**: Producto activo y disponible para compra

## 🏷️ Disponibilidad

- **📦 En Stock**: Producto con inventario disponible
- **📋 A Pedido**: Producto que se procesa bajo pedido
- **⚡ Activación**: Producto que requiere activación manual

## 📈 Estadísticas

El dashboard muestra:
- **Total de productos** en el sistema
- **Productos publicados** actualmente
- **Productos en stock** disponibles
- **Productos destacados** promocionados
- Distribución por **estado** y **disponibilidad**
- Contadores de **etiquetas** especiales

## 🔐 Permisos

Solo usuarios con rol **admin** pueden:
- Crear productos
- Editar cualquier producto
- Eliminar productos (sin ventas)
- Cambiar estados masivamente
- Ver estadísticas completas

## 🚀 Próximas Mejoras

- [x] **� Estadísticas**: Movidas a Reportes Globales para vista consolidada
- [ ] **� Exportación** de datos a Excel/CSV
- [ ] **🔔 Notificaciones** de stock bajo
- [ ] **📱 App móvil** de gestión
- [ ] **🤖 IA** para optimización de precios
- [ ] **📈 Analytics** de productos más vendidos

## 📊 Estadísticas

Las estadísticas de productos ahora se encuentran en **Admin > Reportes Globales > Tab Productos**, donde puedes ver:
- Métricas consolidadas con otras secciones del sistema
- Estadísticas detalladas por estado y disponibilidad
- Resumen visual con gráficos e indicadores

## 🐛 Reporte de Errores

Si encuentras algún problema, por favor reporta:
1. **Pasos** para reproducir el error
2. **Comportamiento esperado** vs **comportamiento actual**
3. **Screenshots** si es relevante
4. **Información del navegador** y dispositivo

---

**✨ ¡El módulo de gestión de productos está listo y completamente funcional!**
