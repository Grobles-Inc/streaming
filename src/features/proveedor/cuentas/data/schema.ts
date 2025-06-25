import { z } from 'zod'

export const tipoSchema = z.union([
  z.literal('cuenta'),
  z.literal('perfiles'),
  z.literal('combo'),
])
export type Tipo = z.infer<typeof tipoSchema>

export const estadoSchema = z.union([
  z.literal('disponible'),
  z.literal('vendido'),
])
export type Estado = z.infer<typeof estadoSchema>

// Schema para los datos del producto asociado
export const productoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  precio_publico: z.number(),
  proveedor_id: z.string(),
})

export const cuentaSchema = z.object({
  id: z.number(),
  email: z.string().email('Email inválido').nullable(),
  clave: z.string().nullable(),
  pin: z.string().nullable(),
  perfil: z.string().nullable(),
  producto_id: z.string(),
  tipo: tipoSchema,
  url: z.string().nullable(),
  created_at: z.string(),
  estado: estadoSchema,
  publicado: z.boolean(),
  productos: productoSchema.optional(),
})
export type Cuenta = z.infer<typeof cuentaSchema>

export const cuentasListSchema = z.array(cuentaSchema)

// Schema para el formulario de crear/editar cuenta
export const cuentaFormSchema = z.object({
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  clave: z.string().min(1, 'La clave es requerida').optional().or(z.literal('')),
  pin: z.string().optional().or(z.literal('')),
  perfil: z.string().optional().or(z.literal('')),
  producto_id: z.string().min(1, 'Debe seleccionar un producto'),
  tipo: tipoSchema,
  url: z.string().url('URL inválida').optional().or(z.literal('')),
  publicado: z.boolean(),
})
export type CuentaForm = z.infer<typeof cuentaFormSchema> 