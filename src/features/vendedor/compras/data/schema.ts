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
  producto: z.string().min(1, 'Producto es requerido.'),
  email_cuenta: z.string().min(1, 'Email de la cuenta es requerido.'),
  clave_cuenta: z.string().min(1, 'Clave de la cuenta es requerida.'),
  url_cuenta: z.string().min(1, 'URL de la cuenta es requerida.'),
  perfil: z.string().min(1, 'Perfil es requerido.'),
  pin: z.string().optional(),
  fecha_inicio: z.string().min(1, 'Fecha de inicio es requerida.'),
  fecha_termino: z.string().min(1, 'Fecha de término es requerida.'),
  monto_reembolso: z.number().min(1, 'Monto de reembolso es requerido.'),
  nombre_cliente: z.string().min(1, 'Nombre del cliente es requerido.'),
  telefono_cliente: z.string().min(1, 'Teléfono del cliente es requerido.'),
  proveedor: z.string().min(1, 'Proveedor es requerido.'),
  telefono_proveedor: z.string().min(1, 'Teléfono del proveedor es requerido.'),
  dias_restantes: z.number().min(1, 'Días restantes es requerido.'),
  estado: compraEstadoSchema,
})


export type CompraEstado = z.infer<typeof compraEstadoSchema>
export type Compra = z.infer<typeof compraSchema>


