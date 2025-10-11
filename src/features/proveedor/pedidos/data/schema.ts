import { z } from 'zod'

const pedidoEstadoSchema = z.union([
  z.literal('resuelto'),
  z.literal('soporte'),
  z.literal('vencido'),
  z.literal('pedido'),
  z.literal('entregado'),
  z.literal('renovado'),
])

export const pedidoSchema = z
  .object({
    id: z.number().optional(),
    proveedor_id: z.string().optional(),
    producto_id: z.number().optional(),
    vendedor_id: z.string().optional(),
    stock_producto_id: z.number().optional(),
    precio: z.number().min(0, 'Precio debe ser positivo.'),
    fecha_inicio: z.string().nullable().optional(),
    fecha_expiracion: z.string().nullable().optional(),
    renovado: z.boolean().optional(), // Nueva columna para detectar renovaciones por vendedor
    productos: z
      .object({
        nombre: z.string().optional(),
        precio_publico: z.number().optional(),
        tiempo_uso: z.number().optional(),
        precio_renovacion: z.number().nullable().optional(),
      })
      .optional(),
    usuarios: z
      .object({
        nombres: z.string().optional(),
        usuario: z.string().optional(),
        apellidos: z.string().optional(),
        telefono: z.string().nullable(),
      })
      .optional(),
    nombre_cliente: z.string().optional(),
    telefono_cliente: z.string().optional(),
    created_at: z.string().optional(),
    fecha_termino: z.string().optional(),
    monto_reembolso: z.number().optional(),
    estado: pedidoEstadoSchema,
    // Campos de soporte
    soporte_mensaje: z.string().nullable().optional(),
    soporte_asunto: z.string().nullable().optional(),
    soporte_respuesta: z.string().nullable().optional(),
    stock_productos: z
      .object({
        id: z.number().optional(),
        email: z.string().nullable(),
        perfil: z.string().nullable(),
        pin: z.string().nullable(),
        clave: z.string().nullable(),
        url: z.string().nullable(),
        soporte_stock_producto: z
          .enum(['activo', 'soporte', 'vencido'])
          .optional(),
      })
      .optional(),
  })
  .passthrough()

export type PedidoEstado = z.infer<typeof pedidoEstadoSchema>
export type Pedido = z.infer<typeof pedidoSchema>
