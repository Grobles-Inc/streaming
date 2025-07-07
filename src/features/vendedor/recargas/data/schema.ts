import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

const recargaEstadoSchema = z.union([
  z.literal('aprobado'),
  z.literal('pendiente'),
  z.literal('rechazado'),
])

export const recargaSchema = z.object({
  id: z.number(),
  usuario_id: z.string(),
  monto: z.number(),
  estado: recargaEstadoSchema,
  created_at: z.string(),
})

export type Recarga = z.infer<typeof recargaSchema>
export type RecargaEstado = z.infer<typeof recargaEstadoSchema>
