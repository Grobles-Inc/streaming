import { z } from 'zod'

export const usuarioSchema = z.object({
  usuario: z.string().min(2).max(30),
  nombres: z.string().min(2).max(30),
  email: z.string().email(),
  apellidos: z.string().min(2).max(30),
  telefono: z.string().min(10).max(10),
  codigo_referido: z.string().min(10).max(10),
})

export type ProfileFormValues = z.infer<typeof usuarioSchema>
