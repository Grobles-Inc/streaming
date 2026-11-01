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

const divisaSchema = z.enum(['PEN', 'USD'])

export type Divisa = z.infer<typeof divisaSchema>

export interface RecargaFormValues {
  amount?: string
  divisa: Divisa
}

const round2 = (value: number) => Math.round(value * 100) / 100

// configuracion.conversion = soles por 1 USD
export function convertMonto(
  amount: number,
  from: Divisa,
  to: Divisa,
  tasa: number
): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (from === to) return round2(amount)
  if (!Number.isFinite(tasa) || tasa <= 0) return 0

  return from === 'PEN' ? round2(amount / tasa) : round2(amount * tasa)
}

export function formatMonto(amount: number, divisa: Divisa): string {
  const prefix = divisa === 'PEN' ? 'S/' : '$'
  return `${prefix} ${round2(amount).toFixed(2)}`
}
