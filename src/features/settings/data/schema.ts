import { z } from 'zod'

export const usuarioSchema = z.object({
  usuario: z.string().min(2).max(30).optional(),
  nombres: z.string().min(2).max(30).optional(),
  email: z.string().email().optional(),
  apellidos: z.string().min(2).max(30).optional(),
  telefono: z.string().optional(),
  codigo_referido: z.string().min(10).max(10).optional(),
})

export type ProfileFormValues = z.infer<typeof usuarioSchema>
