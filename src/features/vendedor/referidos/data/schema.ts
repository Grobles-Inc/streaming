import { z } from 'zod'


export const referidoSchema = z.object({
  id: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  telefono: z.string(),
  usuarios: z.object({
    codigo_referido: z.string(),
  }).optional(),
})

export type Referido = z.infer<typeof referidoSchema>
