import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

const recargaEstadoSchema = z.union([
  z.literal('aprobado'),
  z.literal('pendiente'),
  z.literal('rechazado'),
])

export const recargaSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  monto: z.number(),
  comision: z.number(),
  estado: recargaEstadoSchema,
  metodo_pago: z.enum(['transferencia', 'yape']),
  created_at: z.string(),
})

export type Recarga = z.infer<typeof recargaSchema>
export type RecargaEstado = z.infer<typeof recargaEstadoSchema>
