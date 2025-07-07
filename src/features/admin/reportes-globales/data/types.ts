export type Usuario = {
  id: string
  email: string
  nombres: string
  apellidos: string
  avatar: string
  telefono: string | null
  rol: 'provider' | 'admin' | 'seller'
  balance: number
  created_at: string
  updated_at: string
}

export type Producto = {
  id: string
  nombre: string
  descripcion: string | null
  informacion: string | null
  condiciones: string | null
  precio_publico: number
  precio_vendedor: number
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
  disponibilidad: 'en_stock' | 'a_pedido' | 'activacion'
  renovable: boolean
  solicitud: string | null
  muestra_disponibilidad_stock: boolean
  deshabilitar_boton_comprar: boolean
  precio_renovacion: number | null
  stock_de_productos: any | null
  // Relaciones
  categorias?: {
    id: string
    nombre: string
    descripcion: string | null
  }
  usuarios?: {
    nombres: string
    apellidos: string
  }
}

export type Recarga = {
  id: string
  usuario_id: string
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  created_at: string
  updated_at: string
  // Relación
  usuarios?: {
    nombres: string
    apellidos: string
  }
}

export type MetricasGlobales = {
  totalUsuarios: number
  totalProductos: number
  totalRecargas: number
  montoTotalRecargado: number
  usuariosPorRol: {
    admin: number
    provider: number
    seller: number
  }
  productosPorCategoria: Array<{
    categoria: string
    cantidad: number
  }>
  recargasPorEstado: {
    aprobado: number
    pendiente: number
    rechazado: number
  }
}
