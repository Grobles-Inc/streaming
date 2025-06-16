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
  monto: z.number(),
  comision: z.number(),
  saldo: z.number(),
  fecha: z.string(),
  estado: z.enum(['aprobado', 'pendiente', 'rechazado']),
  metodo: z.enum(['transferencia', 'yape']),
})

export type Recarga = z.infer<typeof recargaSchema>
export type RecargaEstado = z.infer<typeof recargaEstadoSchema>
