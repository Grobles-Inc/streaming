import { z } from 'zod'

const usuarioSchema = z.object({
  id: z.string(),
  usuario: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  email: z.string(),
  telefono: z.string().nullable(),
  rol: z.enum(['provider', 'admin', 'seller', 'registered']),
})

export const billeteraSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  saldo: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  usuario: usuarioSchema.optional(),
})

export type Billetera = z.infer<typeof billeteraSchema>

// The database row from Supabase includes the joined usuario, so we just parse directly
export function mapBilleteraToComponent(row: Billetera): Billetera {
  return billeteraSchema.parse(row)
}