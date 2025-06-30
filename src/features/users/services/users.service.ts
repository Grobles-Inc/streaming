import { supabase } from '@/lib/supabase'

export type SupabaseUser = {
  id: string
  email: string
  nombres: string
  apellidos: string
  avatar: string
  telefono: string | null
  rol: 'provider' | 'admin' | 'seller'
  balance: number
  created_at: string
  updated_at: string
}

export type SupabaseUserWithWallet = SupabaseUser & {
  saldo_billetera: number | null
  billetera_id: string | null
}

export type CreateUserData = {
  email: string
  nombres: string
  apellidos: string
  avatar?: string
  telefono?: string | null
  rol?: 'provider' | 'admin' | 'seller'
  balance?: number
}

export type UpdateUserData = Partial<Omit<SupabaseUser, 'id' | 'created_at' | 'updated_at'>>

export class UsersService {
  // Obtener todos los usuarios con saldo desde billeteras
  static async getUsers(): Promise<SupabaseUserWithWallet[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }
    
    // Mapear los datos para incluir el saldo de billetera
    return (data || []).map(user => ({
      ...user,
      saldo_billetera: user.billeteras?.[0]?.saldo || null,
      billetera_id: user.billeteras?.[0]?.id || null
    }))
  }

  // Obtener usuario por ID con saldo desde billeteras
  static async getUserById(id: string): Promise<SupabaseUserWithWallet | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null // Usuario no encontrado
      }
      console.error('Error fetching user by ID:', error)
      throw error
    }
    
    return {
      ...data,
      saldo_billetera: data.billeteras?.[0]?.saldo || null,
      billetera_id: data.billeteras?.[0]?.id || null
    }
  }

  // Crear nuevo usuario
  static async createUser(userData: CreateUserData): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        ...userData,
        avatar: userData.avatar || '',
        rol: userData.rol || 'seller',
        balance: userData.balance || 0
      })
      .select('*')
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      throw error
    }
    
    return data
  }

  // Actualizar usuario
  static async updateUser(id: string, userData: UpdateUserData): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      throw error
    }
    
    return data
  }

  // Eliminar usuario
  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Buscar usuarios por nombre con saldo desde billeteras
  static async searchUsersByName(name: string): Promise<SupabaseUserWithWallet[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .or(`nombres.ilike.%${name}%,apellidos.ilike.%${name}%`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error searching users by name:', error)
      throw error
    }
    
    return (data || []).map(user => ({
      ...user,
      saldo_billetera: user.billeteras?.[0]?.saldo || null,
      billetera_id: user.billeteras?.[0]?.id || null
    }))
  }

  // Filtrar usuarios por rol con saldo desde billeteras
  static async filterByRole(role: 'admin' | 'provider' | 'seller'): Promise<SupabaseUserWithWallet[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .eq('rol', role)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error filtering users by role:', error)
      throw error
    }
    
    return (data || []).map(user => ({
      ...user,
      saldo_billetera: user.billeteras?.[0]?.saldo || null,
      billetera_id: user.billeteras?.[0]?.id || null
    }))
  }

  // Actualizar balance del usuario
  static async updateUserBalance(id: string, newBalance: number): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error updating user balance:', error)
      throw error
    }
    
    return data
  }

  // Obtener estadísticas de usuarios
  static async getUserStats() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
    
    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
    
    const stats = {
      total: data?.length || 0,
      admin: data?.filter(u => u.rol === 'admin').length || 0,
      provider: data?.filter(u => u.rol === 'provider').length || 0,
      seller: data?.filter(u => u.rol === 'seller').length || 0
    }
    
    return stats
  }
}
