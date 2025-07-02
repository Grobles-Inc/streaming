import { z } from 'zod'

// Esquema para estado de compra
const estadoCompraSchema = z.union([
  z.literal('resuelto'),
  z.literal('vencido'),
  z.literal('soporte'),
  z.literal('reembolsado'),
  z.literal('pedido_entregado'),
])

// Esquema para compra base
const compraBaseSchema = z.object({
  id: z.string(),
  proveedor_id: z.string(),
  producto_id: z.string(),
  vendedor_id: z.string().nullable(),
  stock_producto_id: z.number().nullable(),
  email_cuenta: z.string(),
  clave_cuenta: z.string(),
  pin_cuenta: z.string().nullable(),
  perfil_usuario: z.string().nullable(),
  nombre_cliente: z.string(),
  telefono_cliente: z.string(),
  precio: z.number().min(0),
  estado: estadoCompraSchema,
  monto_reembolso: z.number().min(0),
  created_at: z.string(),
  updated_at: z.string(),
})

// Esquema para compra con relaciones
const compraWithRelationsSchema = compraBaseSchema.extend({
  proveedor: z.object({
    id: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    telefono: z.string().nullable(),
  }).optional(),
  vendedor: z.object({
    id: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    telefono: z.string().nullable(),
  }).optional(),
  producto: z.object({
    id: z.string(),
    nombre: z.string(),
    descripcion: z.string().nullable(),
    precio_publico: z.number(),
    imagen_url: z.string().nullable(),
  }).optional(),
  stock_producto: z.object({
    id: z.number(),
    email: z.string().nullable(),
    tipo: z.string(),
    estado: z.string(),
  }).optional(),
})

// Esquema para compra mapeada
const mappedCompraSchema = z.object({
  id: z.string(),
  proveedorId: z.string(),
  proveedorNombre: z.string(),
  vendedorId: z.string().nullable(),
  vendedorNombre: z.string(),
  productoId: z.string(),
  productoNombre: z.string(),
  stockProductoId: z.number().nullable(),
  emailCuenta: z.string(),
  claveCuenta: z.string(),
  pinCuenta: z.string().nullable(),
  perfilUsuario: z.string().nullable(),
  nombreCliente: z.string(),
  telefonoCliente: z.string(),
  precio: z.number(),
  precioFormateado: z.string(),
  estado: estadoCompraSchema,
  montoReembolso: z.number(),
  montoReembolsoFormateado: z.string(),
  fechaCreacion: z.date(),
  fechaActualizacion: z.date(),
  puedeModificar: z.boolean(),
  requiereReembolso: z.boolean(),
  tiempoTranscurrido: z.string(),
})

// Esquema para filtros
const filtroCompraSchema = z.object({
  estado: estadoCompraSchema.optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  proveedorId: z.string().optional(),
  vendedorId: z.string().optional(),
  productoId: z.string().optional(),
})

// Tipos exportados
export type CompraBase = z.infer<typeof compraBaseSchema>
export type CompraWithRelations = z.infer<typeof compraWithRelationsSchema>
export type MappedCompra = z.infer<typeof mappedCompraSchema>
export type FiltroCompra = z.infer<typeof filtroCompraSchema>

// Función para mapear compra de Supabase a componente
export function mapSupabaseCompraToComponent(compra: CompraWithRelations): MappedCompra {
  const proveedorNombre = compra.proveedor 
    ? `${compra.proveedor.nombres} ${compra.proveedor.apellidos}`.trim()
    : 'Proveedor no encontrado'
  
  const vendedorNombre = compra.vendedor 
    ? `${compra.vendedor.nombres} ${compra.vendedor.apellidos}`.trim()
    : 'Sin vendedor asignado'

  const productoNombre = compra.producto?.nombre || 'Producto no encontrado'

  const precioFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(compra.precio)

  const montoReembolsoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(compra.monto_reembolso)

  const fechaCreacion = new Date(compra.created_at)
  const fechaActualizacion = new Date(compra.updated_at)
  const ahora = new Date()

  // Calcular tiempo transcurrido
  const tiempoTranscurridoMs = ahora.getTime() - fechaCreacion.getTime()
  const tiempoTranscurridoDias = Math.floor(tiempoTranscurridoMs / (1000 * 60 * 60 * 24))
  const tiempoTranscurrido = tiempoTranscurridoDias > 0 
    ? `${tiempoTranscurridoDias} día(s)`
    : 'Menos de 1 día'

  return {
    id: compra.id,
    proveedorId: compra.proveedor_id,
    proveedorNombre,
    vendedorId: compra.vendedor_id,
    vendedorNombre,
    productoId: compra.producto_id,
    productoNombre,
    stockProductoId: compra.stock_producto_id,
    emailCuenta: compra.email_cuenta,
    claveCuenta: compra.clave_cuenta,
    pinCuenta: compra.pin_cuenta,
    perfilUsuario: compra.perfil_usuario,
    nombreCliente: compra.nombre_cliente,
    telefonoCliente: compra.telefono_cliente,
    precio: compra.precio,
    precioFormateado,
    estado: compra.estado,
    montoReembolso: compra.monto_reembolso,
    montoReembolsoFormateado,
    fechaCreacion,
    fechaActualizacion,
    puedeModificar: ['soporte', 'vencido', 'pedido_entregado'].includes(compra.estado),
    requiereReembolso: compra.estado === 'reembolsado' && compra.monto_reembolso > 0,
    tiempoTranscurrido,
  }
}

// Validadores
export { estadoCompraSchema, filtroCompraSchema }
