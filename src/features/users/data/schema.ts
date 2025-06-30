import { z } from 'zod'

// Esquema para roles de Supabase
const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('provider'),
  z.literal('seller'),
])
export type UserRole = z.infer<typeof userRoleSchema>

// Esquema principal del usuario de Supabase
// Estructura real de la tabla usuarios:
// - id: string (FK a auth.users.id)
// - email: string (existe en usuarios según types)
// - nombres: string (plural)
// - apellidos: string (plural)  
// - avatar: string
// - telefono: string | null
// - rol: 'provider' | 'admin' | 'seller'
// - balance: number (pero el saldo real está en billeteras.saldo)
// - created_at: string
// - updated_at: string
const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  avatar: z.string(),
  telefono: z.string().nullable(),
  rol: userRoleSchema,
  balance: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type User = z.infer<typeof userSchema>

// Tipo extendido que incluye el saldo real desde billeteras
export type UserWithWallet = User & {
  saldo_billetera: number | null // Saldo real desde billeteras.saldo
  billetera_id: string | null // ID de la billetera
}

// Para compatibilidad con el componente existente, mapeamos los campos (todo en español)
const mappedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombres: z.string(),
  apellidos: z.string(),
  telefono: z.string().nullable(),
  avatar: z.string(),
  rol: userRoleSchema,
  saldo: z.number(),
  billetera_id: z.string().nullable(),
  fechaCreacion: z.coerce.date(),
  fechaActualizacion: z.coerce.date(),
})
export type MappedUser = z.infer<typeof mappedUserSchema>

export const userListSchema = z.array(mappedUserSchema)

// Función para mapear usuario de Supabase a formato del componente
export function mapSupabaseUserToComponent(supabaseUser: UserWithWallet): MappedUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    nombres: supabaseUser.nombres || '',
    apellidos: supabaseUser.apellidos || '',
    telefono: supabaseUser.telefono,
    avatar: supabaseUser.avatar || '',
    rol: supabaseUser.rol,
    saldo: supabaseUser.saldo_billetera || 0, // Usar el saldo de la billetera
    billetera_id: supabaseUser.billetera_id,
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
  if (componentUser.telefono !== undefined) mapped.telefono = componentUser.telefono
  if (componentUser.avatar) mapped.avatar = componentUser.avatar
  if (componentUser.rol) mapped.rol = componentUser.rol
  // Nota: El saldo se actualiza en la tabla billeteras, no aquí
  
  return mapped
}
