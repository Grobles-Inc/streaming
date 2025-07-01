
// Estados de compra
export type EstadoCompra = 'resuelto' | 'vencido' | 'soporte' | 'reembolsado' | 'pedido_entregado'

// Tipo base de compra desde Supabase (basado en el schema actualizado)
export type SupabaseCompra = {
  id: string
  proveedor_id: string
  producto_id: string
  vendedor_id: string | null
  stock_producto_id: number | null
  email_cuenta: string
  clave_cuenta: string
  pin_cuenta: string | null
  perfil_usuario: string | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado: EstadoCompra
  monto_reembolso: number
  created_at: string
  updated_at: string
}

// Tipo para crear una nueva compra
export type CreateCompraData = {
  proveedor_id: string
  producto_id: string
  vendedor_id?: string | null
  stock_producto_id?: number | null
  email_cuenta: string
  clave_cuenta: string
  pin_cuenta?: string | null
  perfil_usuario?: string | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado?: EstadoCompra
  monto_reembolso?: number
}

// Tipo para actualizar una compra
export type UpdateCompraData = {
  id?: string
  proveedor_id?: string
  producto_id?: string
  vendedor_id?: string | null
  stock_producto_id?: number | null
  email_cuenta?: string
  clave_cuenta?: string
  pin_cuenta?: string | null
  perfil_usuario?: string | null
  nombre_cliente?: string
  telefono_cliente?: string
  precio?: number
  estado?: EstadoCompra
  monto_reembolso?: number
}

// Tipo de compra con información relacionada
export type CompraWithRelations = SupabaseCompra & {
  proveedor?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
  }
  vendedor?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
  }
  producto?: {
    id: string
    nombre: string
    descripcion: string | null
    precio_publico: number
    imagen_url: string | null
  }
  stock_producto?: {
    id: number
    email: string | null
    tipo: string
    estado: string
  }
}

// Filtros para compras
export type FiltroCompra = {
  estado?: EstadoCompra
  fechaDesde?: string
  fechaHasta?: string
  proveedorId?: string
  vendedorId?: string
  productoId?: string
}

// Estadísticas de compras
export type EstadisticasCompras = {
  total: number
  resueltas: number
  vencidas: number
  soporte: number
  reembolsadas: number
  pedidoEntregado: number
  ingresoTotal: number
  ingresoResuelto: number
  montoReembolsado: number
}

// Compra mapeada para el componente
export type MappedCompra = {
  id: string
  proveedorId: string
  proveedorNombre: string
  vendedorId: string | null
  vendedorNombre: string
  productoId: string
  productoNombre: string
  stockProductoId: number | null
  emailCuenta: string
  claveCuenta: string
  pinCuenta: string | null
  perfilUsuario: string | null
  nombreCliente: string
  telefonoCliente: string
  precio: number
  precioFormateado: string
  estado: EstadoCompra
  montoReembolso: number
  montoReembolsoFormateado: string
  fechaCreacion: Date
  fechaActualizacion: Date
  // Datos adicionales para la UI
  puedeModificar: boolean
  requiereReembolso: boolean
  tiempoTranscurrido: string
}
