import { z } from 'zod'

export const categoriaSchema = z.union([
  z.literal('netflix'),
  z.literal('spotify'),
  z.literal('prime_video'),
  z.literal('disney_plus'),
  z.literal('youtube_premium'),
  z.literal('hbo_max'),
  z.literal('crunchyroll'),
  z.literal('paramount'),
  z.literal('apple_tv'),
  z.literal('otros'),
])
export type Categoria = z.infer<typeof categoriaSchema>

export const productoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  proveedor: z.string(),
  categorias: z.array(categoriaSchema),
  precio: z.number(),
  stock: z.number(),
  fechaInicio: z.coerce.date(),
  fechaFinalizacion: z.coerce.date(),
  renovable: z.boolean(),
  aPedido: z.boolean(),
  publicado: z.boolean(),
})
export type Producto = z.infer<typeof productoSchema>

export const productosListSchema = z.array(productoSchema) 