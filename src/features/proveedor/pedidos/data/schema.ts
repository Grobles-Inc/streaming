import { z } from 'zod'

const pedidoEstadoSchema = z.union([
  z.literal('resuelto'),
  z.literal('soporte'),
  z.literal('vencido'),
  z.literal('pedido'),
  z.literal('entregado'),
])

export const pedidoSchema = z.object({
  id: z.string().optional(),
  proveedor_id: z.string().optional(),
  producto_id: z.string().optional(),
  vendedor_id: z.string().optional(),
  stock_producto_id: z.number().optional(),
  precio: z.number().min(0, 'Precio debe ser positivo.'),
  productos: z.object({
    nombre: z.string().optional(),
    precio_publico: z.number().optional(),
    stock: z.number().optional(),
  }).optional(),
  usuarios: z.object({
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    telefono: z.string().nullable(),
  }).optional(),
  nombre_cliente: z.string().optional(),
  telefono_cliente: z.string().optional(),
  created_at: z.string().optional(),
  fecha_inicio: z.string().optional(),
  fecha_termino: z.string().optional(),
  monto_reembolso: z.number().optional(),
  estado: pedidoEstadoSchema,
  stock_productos: z.object({
    email: z.string().nullable(),
    perfil: z.string().nullable(),
    pin: z.string().nullable(),
    clave: z.string().nullable(),
  }).optional(),
}).passthrough()

export type PedidoEstado = z.infer<typeof pedidoEstadoSchema>
export type Pedido = z.infer<typeof pedidoSchema> 