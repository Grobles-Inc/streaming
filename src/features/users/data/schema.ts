import { z } from 'zod'
import type { SupabaseUserWithWallet } from '../services/users.service'

// Esquema para roles de Supabase
const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('registered'),
  z.literal('provider'),
  z.literal('seller'),
])
export type UserRole = z.infer<typeof userRoleSchema>

// Esquema principal del usuario de Supabase
// Estructura real de la tabla usuarios (actualizada):
// - id: string (FK a auth.users.id)
// - email: string
// - nombres: string
// - apellidos: string  
// - usuario: string (nuevo)
// - password: string (nuevo)
// - billetera_id: string | null (nuevo, opcional)
// - codigo_referido: string (nuevo)
// - referido_id: string | null (nuevo, FK a usuarios.id)
// - telefono: string | null
// - rol: 'admin' | 'registered' | 'provider' | 'seller'
// - created_at: string
// - updated_at: string
const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  usuario: z.string(),
  password: z.string(),
  billetera_id: z.string().nullable(),
  codigo_referido: z.string(),
  referido_id: z.string().nullable(),
  telefono: z.string().nullable(),
  rol: userRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
  estado_habilitado: z.boolean(),
})
export type User = z.infer<typeof userSchema>

// Tipo extendido que incluye el saldo real desde billeteras
export type UserWithWallet = User & {
  saldo_billetera: number | null // Saldo real desde billeteras.saldo
}

// Para compatibilidad con el componente existente, mapeamos los campos (todo en español)
const mappedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  usuario: z.string(),
  password: z.string(),
  telefono: z.string().nullable(),
  rol: userRoleSchema,
  saldo: z.number(),
  billetera_id: z.string().nullable(),
  codigo_referido: z.string(),
  referido_id: z.string().nullable(),
  referido_por_nombre: z.string().nullable(), // Nombre del usuario que lo refirió
  estado_habilitado: z.boolean(),
  fechaCreacion: z.coerce.date(),
  fechaActualizacion: z.coerce.date(),
})
export type MappedUser = z.infer<typeof mappedUserSchema>

export const userListSchema = z.array(mappedUserSchema)

// Función para mapear usuario de Supabase a formato del componente
export function mapSupabaseUserToComponent(supabaseUser: SupabaseUserWithWallet): MappedUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nombres: supabaseUser.nombres || '',
    apellidos: supabaseUser.apellidos || '',
    usuario: supabaseUser.usuario || '',
    password: supabaseUser.password || '',
    telefono: supabaseUser.telefono,
    rol: supabaseUser.rol,
    saldo: supabaseUser.saldo_billetera || 0, // Usar el saldo de la billetera
    billetera_id: supabaseUser.billetera_id,
    codigo_referido: supabaseUser.codigo_referido || '',
    referido_id: supabaseUser.referido_id || null,
    referido_por_nombre: supabaseUser.referido_por_nombre || null,
    estado_habilitado: supabaseUser.estado_habilitado || true,
    fechaCreacion: new Date(supabaseUser.created_at),
    fechaActualizacion: new Date(supabaseUser.updated_at),
  }
}

// Función para mapear datos del componente a Supabase
export function mapComponentUserToSupabase(componentUser: Partial<MappedUser>): Partial<User> {
  const mapped: Partial<User> = {}
  
  if (componentUser.nombres) mapped.nombres = componentUser.nombres
  if (componentUser.apellidos) mapped.apellidos = componentUser.apellidos
  if (componentUser.email) mapped.email = componentUser.email
  if (componentUser.usuario) mapped.usuario = componentUser.usuario
  if (componentUser.password) mapped.password = componentUser.password
  if (componentUser.telefono !== undefined) mapped.telefono = componentUser.telefono
  if (componentUser.rol) mapped.rol = componentUser.rol
  if (componentUser.billetera_id) mapped.billetera_id = componentUser.billetera_id
  if (componentUser.codigo_referido) mapped.codigo_referido = componentUser.codigo_referido
  // Nota: El saldo se actualiza en la tabla billeteras, no aquí
  
  return mapped
}
