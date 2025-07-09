
// Estados de compra
export type EstadoCompra = 'resuelto' | 'vencido' | 'soporte' | 'reembolsado' | 'pedido_entregado'

// Tipo base de compra desde Supabase (basado en el schema actualizado)
export type SupabaseCompra = {
  id: number
  proveedor_id: string
  producto_id: number
  vendedor_id: string | null
  stock_producto_id: number | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado: EstadoCompra
  monto_reembolso: number
  fecha_expiracion: string | null
  soporte_mensaje: string | null
  soporte_asunto: string | null
  soporte_respuesta: string | null
  created_at: string
  updated_at: string
}

// Tipo para crear una nueva compra
export type CreateCompraData = {
  proveedor_id: string
  producto_id: number
  vendedor_id?: string | null
  stock_producto_id?: number | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado?: EstadoCompra
  monto_reembolso?: number
  fecha_expiracion?: string | null
  soporte_mensaje?: string | null
  soporte_asunto?: string | null
  soporte_respuesta?: string | null
}

// Tipo para actualizar una compra
export type UpdateCompraData = {
  id?: number
  proveedor_id?: string
  producto_id?: number
  vendedor_id?: string | null
  stock_producto_id?: number | null
  nombre_cliente?: string
  telefono_cliente?: string
  precio?: number
  estado?: EstadoCompra
  monto_reembolso?: number
  fecha_expiracion?: string | null
  soporte_mensaje?: string | null
  soporte_asunto?: string | null
  soporte_respuesta?: string | null
}

// Tipo de compra con información relacionada
export type CompraWithRelations = SupabaseCompra & {
  proveedor?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
  }
  producto?: {
    id: number
    nombre: string
    descripcion: string | null
    precio_publico: number
    imagen_url: string | null
  }
  stock_producto?: {
    id: number
    email: string | null
    clave: string | null
    pin: string | null
    perfil: string | null
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
  productoId?: number
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
  id: number
  proveedorId: string
  proveedorNombre: string
  vendedorId: string | null
  vendedorNombre?: string
  productoId: number
  productoNombre: string
  stockProductoId: number | null
  emailCuenta?: string
  claveCuenta?: string
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
  fechaExpiracion: Date | null
  soporteMensaje: string | null
  soporteAsunto: string | null
  soporteRespuesta: string | null
  // Datos adicionales para la UI
  puedeModificar: boolean
  requiereReembolso: boolean
  tiempoTranscurrido: string
}
