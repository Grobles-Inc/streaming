import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

const compraEstadoSchema = z.union([
  z.literal('resuelto'),
  z.literal('soporte'),
  z.literal('vencidos'),
  z.literal('pedido'),
  z.literal('entregado'),
])

export const compraSchema = z.object({
  id: z.string(),
  producto: z.string(),
  email_cuenta: z.string(),
  clave_cuenta: z.string(),
  url_cuenta: z.string(),
  perfil: z.string(),
  pin: z.string().optional(),
  fecha_inicio: z.string(),
  fecha_termino: z.string(),
  monto_reembolso: z.number(),
  nombre_cliente: z.string(),
  telefono_cliente: z.string(),
  proveedor: z.string(),
  dias_restantes: z.number(),
  estado: compraEstadoSchema,
})


export type CompraEstado = z.infer<typeof compraEstadoSchema>

export type Compra = z.infer<typeof compraSchema>
