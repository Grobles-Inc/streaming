// Estados y tipos de productos
export type EstadoProducto = 'borrador' | 'publicado'
export type DisponibilidadProducto = 'en_stock' | 'a_pedido' | 'activacion'

// Tipo base de producto desde Supabase
export type SupabaseProducto = {
  id: string
  nombre: string
  descripcion: string | null
  informacion: string | null
  condiciones: string | null
  precio_publico: number
  stock: number
  categoria_id: string
  proveedor_id: string
  imagen_url: string | null
  created_at: string
  updated_at: string
  tiempo_uso: number
  a_pedido: boolean
  nuevo: boolean
  descripcion_completa: string | null
  disponibilidad: DisponibilidadProducto
  renovable: boolean
  solicitud: string | null
  muestra_disponibilidad_stock: boolean
  deshabilitar_boton_comprar: boolean
  precio_vendedor: number
  precio_renovacion: number | null
  estado: EstadoProducto
}

// Tipo para crear un nuevo producto
export type CreateProductoData = {
  nombre: string
  descripcion?: string | null
  informacion?: string | null
  condiciones?: string | null
  precio_publico: number
  stock?: number
  categoria_id: string
  proveedor_id: string
  imagen_url?: string | null
  tiempo_uso?: number
  a_pedido?: boolean
  nuevo?: boolean
  descripcion_completa?: string | null
  disponibilidad: DisponibilidadProducto
  renovable?: boolean
  solicitud?: string | null
  muestra_disponibilidad_stock?: boolean
  deshabilitar_boton_comprar?: boolean
  precio_vendedor: number
  precio_renovacion?: number | null
  estado?: EstadoProducto
}

// Tipo para actualizar un producto
export type UpdateProductoData = Partial<CreateProductoData> & {
  id: string
}

// Tipo de producto con información relacionada
export type ProductoWithRelations = SupabaseProducto & {
  categoria?: {
    id: string
    nombre: string
    descripcion: string | null
  }
  proveedor?: {
    id: string
    nombres: string
    apellidos: string
    email: string
  }
  stock_productos?: {
    id: number
    estado: 'disponible' | 'vendido'
  }[]
}

// Filtros para productos
export type FiltroProducto = {
  estado?: EstadoProducto
  categoria_id?: string
  proveedor_id?: string
  disponibilidad?: DisponibilidadProducto
  nuevo?: boolean
  busqueda?: string
}

// Estadísticas de productos
export type EstadisticasProductos = {
  total: number
  publicados: number
  borradores: number
  enStock: number
  aPedido: number
  activacion: number
  nuevos: number
}

// Producto mapeado para el componente
export type MappedProducto = {
  id: string
  nombre: string
  descripcion: string | null
  informacion: string | null
  condiciones: string | null
  precioPublico: number
  precioPublicoFormateado: string
  precioVendedor: number
  precioVendedorFormateado: string
  precioRenovacion: number | null
  precioRenovacionFormateado: string | null
  stock: number
  categoriaId: string
  categoriaNombre: string
  proveedorId: string
  proveedorNombre: string
  imagenUrl: string | null
  fechaCreacion: Date
  fechaActualizacion: Date
  tiempoUso: number
  aPedido: boolean
  nuevo: boolean
  descripcionCompleta: string | null
  disponibilidad: DisponibilidadProducto
  renovable: boolean
  solicitud: string | null
  muestraDisponibilidadStock: boolean
  deshabilitarBotonComprar: boolean
  estado: EstadoProducto
  stockDisponible: number
  stockVendido: number
  // Datos adicionales para la UI
  puedeEditar: boolean
  puedeEliminar: boolean
  tiempoUsoFormateado: string
  etiquetas: string[]
}
