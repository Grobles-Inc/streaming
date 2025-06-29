import { z } from 'zod'

export const transaccionSchema = z.object({
  id: z.string(),
  id_usuario: z.string(),
  estado: z.enum(['pendiente', 'completado', 'fallido', 'cancelado']),
  tx_fecha: z.string(),
  articulos: z.string(),
  tipo: z.enum(['recarga', 'retiro', 'compra', 'venta', 'comision']),
  total: z.number(),
  cambio: z.number(),
  saldo: z.number(),
})

export const agregarFondosSchema = z.object({
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
})

export const retirarFondosSchema = z.object({
  cantidad: z.number().min(1, 'La cantidad debe ser mayor a 0'),
})

export type Transaccion = z.infer<typeof transaccionSchema>
export type AgregarFondos = z.infer<typeof agregarFondosSchema>
export type RetirarFondos = z.infer<typeof retirarFondosSchema> 