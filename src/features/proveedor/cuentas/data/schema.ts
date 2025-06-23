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
  z.literal('bloqueado'),
  z.literal('mantenimiento'),
])
export type Estado = z.infer<typeof estadoSchema>

export const cuentaSchema = z.object({
  id: z.string(),
  productoId: z.string(),
  productoNombre: z.string(),
  tipo: tipoSchema,
  cuentaEmail: z.string().email('Email inválido'),
  cuentaClave: z.string().min(1, 'La clave es requerida'),
  cuentaUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  perfil: z.string().optional(),
  pin: z.string().optional(),
  creado: z.coerce.date(),
  estado: estadoSchema,
  publicado: z.boolean(),
})
export type Cuenta = z.infer<typeof cuentaSchema>

export const cuentasListSchema = z.array(cuentaSchema)

// Schema para el formulario de crear/editar cuenta
export const cuentaFormSchema = z.object({
  productoId: z.string().min(1, 'Debe seleccionar un producto'),
  tipo: tipoSchema,
  cuentaEmail: z.string().email('Email inválido'),
  cuentaClave: z.string().min(1, 'La clave es requerida'),
  cuentaUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  perfil: z.string().optional(),
  pin: z.string().optional(),
})
export type CuentaForm = z.infer<typeof cuentaFormSchema> 