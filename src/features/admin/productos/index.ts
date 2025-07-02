// Componentes principales
export { ProductosPage } from './productos-page'
export { ProductosTable } from './components/productos-table'
export { ProductoForm } from './components/producto-form'
export { ProductoFormModal } from './components/producto-form-modal'
export { ProductoDetailsModal } from './components/producto-details-modal'

// Hooks
export { useProductos } from './hooks/use-productos'

// Tipos y schemas
export type * from './data/types'
export { 
  estadoProductoSchema, 
  disponibilidadProductoSchema, 
  filtroProductoSchema, 
  createProductoSchema, 
  updateProductoSchema,
  mapSupabaseProductoToComponent 
} from './data/schema'

// Servicios
export { ProductosService } from './services/productos.service'
