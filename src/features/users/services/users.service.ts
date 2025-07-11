import { supabase } from '@/lib/supabase'

export type SupabaseUser = {
  id: string
  email: string
  nombres: string
  apellidos: string
  usuario: string
  password: string
  telefono: string | null
  codigo_referido: string
  referido_id: string | null
  billetera_id: string | null
  rol: 'provider' | 'admin' | 'seller' | 'registered'
  estado_habilitado: boolean
  created_at: string
  updated_at: string
}

export type SupabaseUserWithWallet = SupabaseUser & {
  saldo_billetera: number | null
  billetera_id: string | null
  referido_por_nombre?: string | null
}

export type CreateUserData = {
  email: string
  nombres: string
  apellidos: string
  usuario: string
  password?: string
  telefono?: string | null
  codigo_referido?: string
  rol?: 'provider' | 'admin' | 'seller' | 'registered'
}

export type UpdateUserData = Partial<Omit<SupabaseUser, 'id' | 'created_at' | 'updated_at'>>

export class UsersService {
  // Obtener todos los usuarios con saldo desde billeteras
  static async getUsers(includeDisabled: boolean = false): Promise<SupabaseUserWithWallet[]> {
    let query = supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)

    // Por defecto filtrar solo usuarios habilitados
    if (!includeDisabled) {
      query = query.eq('estado_habilitado', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }

    // Obtener información de usuarios referentes por separado
    const usersWithReferrals = await Promise.all((data || []).map(async (user) => {
      let referido_por_nombre: string | null = null
      
      if (user.referido_id) {
        try {
          const { data: referente, error: referenteError } = await supabase
            .from('usuarios')
            .select('nombres, apellidos')
            .eq('id', user.referido_id)
            .single()
          
          if (!referenteError && referente) {
            referido_por_nombre = `${referente.nombres} ${referente.apellidos}`.trim()
          }
        } catch (err) {
          console.warn('Error fetching referente for user:', user.id, err)
        }
      }
      
      return {
        ...user,
        saldo_billetera: user.billeteras?.[0]?.saldo || null,
        billetera_id: user.billeteras?.[0]?.id || null,
        referido_por_nombre
      }
    }))

    return usersWithReferrals
  }

  // Obtener solo usuarios habilitados
  static async getEnabledUsers(): Promise<SupabaseUserWithWallet[]> {
    return this.getUsers(false)
  }

  // Obtener solo usuarios deshabilitados
  static async getDisabledUsers(): Promise<SupabaseUserWithWallet[]> {
    const query = supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .eq('estado_habilitado', false)
      .order('created_at', { ascending: false })

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching disabled users:', error)
      throw error
    }

    // Obtener información de usuarios referentes por separado
    const usersWithReferrals = await Promise.all((data || []).map(async (user) => {
      let referido_por_nombre: string | null = null
      
      if (user.referido_id) {
        try {
          const { data: referente, error: referenteError } = await supabase
            .from('usuarios')
            .select('nombres, apellidos')
            .eq('id', user.referido_id)
            .single()
          
          if (!referenteError && referente) {
            referido_por_nombre = `${referente.nombres} ${referente.apellidos}`.trim()
          }
        } catch (err) {
          console.warn('Error fetching referente for user:', user.id, err)
        }
      }
      
      return {
        ...user,
        saldo_billetera: user.billeteras?.[0]?.saldo || null,
        billetera_id: user.billeteras?.[0]?.id || null,
        referido_por_nombre
      }
    }))

    return usersWithReferrals
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

    // Obtener información del referente si existe
    let referido_por_nombre: string | null = null
    
    if (data.referido_id) {
      try {
        const { data: referente, error: referenteError } = await supabase
          .from('usuarios')
          .select('nombres, apellidos')
          .eq('id', data.referido_id)
          .single()
        
        if (!referenteError && referente) {
          referido_por_nombre = `${referente.nombres} ${referente.apellidos}`.trim()
        }
      } catch (err) {
        console.warn('Error fetching referente for user:', data.id, err)
      }
    }
    
    return {
      ...data,
      saldo_billetera: data.billeteras?.[0]?.saldo || null,
      billetera_id: data.billeteras?.[0]?.id || null,
      referido_por_nombre
    }
  }

  // Crear nuevo usuario
  static async createUser(userData: CreateUserData): Promise<SupabaseUser> {
    try {
      console.log('Creating user with data:', userData)
      
      // PASO 1: Crear el usuario SIN billetera_id
      const { data: userData_inserted, error: userError } = await supabase
        .from('usuarios')
        .insert({
          email: userData.email,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          usuario: userData.usuario,
          password: userData.password || '',
          telefono: userData.telefono || null,
          rol: userData.rol || 'seller',
          codigo_referido: userData.codigo_referido || '',
          // No enviar billetera_id inicialmente
        })
        .select('*')
        .single()
      
      if (userError) {
        console.error('Error creating user:', userError)
        console.error('Error details:', JSON.stringify(userError, null, 2))
        console.error('User data:', JSON.stringify(userData, null, 2))
        throw userError
      }
      
      console.log('User created successfully:', userData_inserted)
      
      // PASO 2: Crear la billetera
      const { data: billetera_inserted, error: walletError } = await supabase
        .from('billeteras')
        .insert({
          usuario_id: userData_inserted.id, // ID real del usuario
          saldo: 0
        })
        .select('*')
        .single()
      
      if (walletError) {
        // Si falla la creación de la billetera, eliminar el usuario creado
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', userData_inserted.id)
          
        console.error('Error creating wallet:', walletError)
        throw new Error('Error al crear la billetera: ' + walletError.message)
      }
      
      console.log('Wallet created successfully:', billetera_inserted)
      
      // PASO 3: Actualizar el usuario con el ID de la billetera
      const { data: updated_user, error: updateError } = await supabase
        .from('usuarios')
        .update({
          billetera_id: billetera_inserted.id
        })
        .eq('id', userData_inserted.id)
        .select('*')
        .single()
      
      if (updateError) {
        // Si falla la actualización, limpiar usuario y billetera
        await supabase.from('billeteras').delete().eq('id', billetera_inserted.id)
        await supabase.from('usuarios').delete().eq('id', userData_inserted.id)
        
        console.error('Error updating user with wallet ID:', updateError)
        throw new Error('Error al vincular la billetera: ' + updateError.message)
      }
      
      console.log('User updated with wallet ID:', updated_user)
      
      return updated_user
      
    } catch (error) {
      console.error('Error in user creation process:', error)
      throw error
    }
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

  // Deshabilitar usuario (soft delete)
  static async deleteUser(id: string): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        estado_habilitado: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error disabling user:', error)
      throw error
    }
    
    console.log('User disabled successfully:', data)
    return data
  }

  // Habilitar usuario
  static async enableUser(id: string): Promise<SupabaseUser> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        estado_habilitado: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error enabling user:', error)
      throw error
    }
    
    console.log('User enabled successfully:', data)
    return data
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
  static async filterByRole(role: 'admin' | 'provider' | 'seller' | 'registered'): Promise<SupabaseUserWithWallet[]> {
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

  // Validar código de referido y obtener usuario referente (solo usuarios habilitados)
  static async validateReferralCode(codigo: string): Promise<SupabaseUser | null> {
    if (!codigo || codigo.trim() === '') {
      return null
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('codigo_referido', codigo.trim())
      .eq('estado_habilitado', true) // Solo usuarios habilitados pueden referir
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Código no encontrado
      }
      console.error('Error validating referral code:', error)
      throw error
    }

    return data
  }

  // Crear usuario con código de referido
  static async createUserWithReferral(userData: CreateUserData, codigoReferido?: string): Promise<SupabaseUser> {
    try {
      console.log('Creating user with referral data:', { userData, codigoReferido })
      
      let referidoPorId: string | null = null
      
      // Validar código de referido si se proporciona
      if (codigoReferido) {
        const usuarioReferente = await this.validateReferralCode(codigoReferido)
        if (usuarioReferente) {
          referidoPorId = usuarioReferente.id
          console.log('Referral user found:', usuarioReferente.nombres, usuarioReferente.apellidos)
        } else {
          throw new Error('Código de referido inválido o no encontrado')
        }
      }
      
      // PASO 1: Crear el usuario directamente en la tabla usuarios
      const userInsertData = {
        email: userData.email,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        usuario: userData.usuario,
        password: userData.password || '',
        telefono: userData.telefono || null,
        rol: userData.rol || 'registered', // Usar el rol correcto del parámetro
        codigo_referido: userData.codigo_referido || this.generateReferralCode(),
        referido_id: referidoPorId, // Establecer la relación de referido
      }
      
      console.log('Insertando usuario con datos:', userInsertData)
      console.log('Rol específico:', userInsertData.rol)
      
      const { data: userData_inserted, error: userError } = await supabase
        .from('usuarios')
        .insert(userInsertData)
        .select('*')
        .single()
      
      if (userError) {
        console.error('Error creating user with referral:', userError)
        throw userError
      }
      
      console.log('User with referral created successfully:', userData_inserted)
      
      // PASO 2: Crear la billetera
      const { data: billetera_inserted, error: walletError } = await supabase
        .from('billeteras')
        .insert({
          usuario_id: userData_inserted.id,
          saldo: 0
        })
        .select('*')
        .single()
      
      if (walletError) {
        // Si falla la creación de la billetera, eliminar el usuario creado
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', userData_inserted.id)
          
        console.error('Error creating wallet for referred user:', walletError)
        throw new Error('Error al crear la billetera: ' + walletError.message)
      }
      
      // PASO 3: Actualizar el usuario con el ID de la billetera
      const { data: updated_user, error: updateError } = await supabase
        .from('usuarios')
        .update({
          billetera_id: billetera_inserted.id
        })
        .eq('id', userData_inserted.id)
        .select('*')
        .single()
      
      if (updateError) {
        // Si falla la actualización, limpiar usuario y billetera
        await supabase.from('billeteras').delete().eq('id', billetera_inserted.id)
        await supabase.from('usuarios').delete().eq('id', userData_inserted.id)
        
        console.error('Error updating user with wallet ID:', updateError)
        throw new Error('Error al vincular la billetera: ' + updateError.message)
      }
      
      console.log('User updated with wallet ID:', updated_user)
      
      return updated_user
      
    } catch (error) {
      console.error('Error in createUserWithReferral:', error)
      throw error
    }
  }

  // Generar código de referido único
  static generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Obtener usuarios referidos por un usuario específico
  static async getReferredUsers(userId: string): Promise<SupabaseUserWithWallet[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        billeteras!billeteras_usuario_id_fkey (
          id,
          saldo
        )
      `)
      .eq('referido_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching referred users:', error)
      throw error
    }
    
    // Mapear los datos para incluir el saldo de billetera
    return (data || []).map(user => ({
      ...user,
      saldo_billetera: user.billeteras?.[0]?.saldo || null,
      billetera_id: user.billeteras?.[0]?.id || null
    }))
  }

  // Eliminar usuario permanentemente (hard delete) y todo lo relacionado
  static async permanentDeleteUser(id: string): Promise<boolean> {
    try {
      console.log('Starting permanent deletion process for user:', id)
      
      // PASO 1: Eliminar todas las transacciones relacionadas
      const { error: transactionsError } = await supabase
        .from('transacciones')
        .delete()
        .eq('usuario_id', id)
      
      if (transactionsError) {
        console.error('Error deleting transactions:', transactionsError)
        throw new Error('Error al eliminar transacciones: ' + transactionsError.message)
      }
      
      // PASO 2: Eliminar todas las recargas relacionadas
      const { error: recargasError } = await supabase
        .from('recargas')
        .delete()
        .eq('usuario_id', id)
      
      if (recargasError) {
        console.error('Error deleting recargas:', recargasError)
        throw new Error('Error al eliminar recargas: ' + recargasError.message)
      }
      
      // PASO 3: Eliminar todos los retiros relacionados
      const { error: retirosError } = await supabase
        .from('retiros')
        .delete()
        .eq('usuario_id', id)
      
      if (retirosError) {
        console.error('Error deleting retiros:', retirosError)
        throw new Error('Error al eliminar retiros: ' + retirosError.message)
      }
      
      // PASO 4: Eliminar todas las compras relacionadas
      const { error: comprasError } = await supabase
        .from('compras')
        .delete()
        .eq('usuario_id', id)
      
      if (comprasError) {
        console.error('Error deleting compras:', comprasError)
        throw new Error('Error al eliminar compras: ' + comprasError.message)
      }
      
      // PASO 5: Eliminar la billetera del usuario
      const { error: walletError } = await supabase
        .from('billeteras')
        .delete()
        .eq('usuario_id', id)
      
      if (walletError) {
        console.error('Error deleting wallet:', walletError)
        throw new Error('Error al eliminar billetera: ' + walletError.message)
      }
      
      // PASO 6: Actualizar usuarios que fueron referidos por este usuario (limpiar la referencia)
      const { error: referralsError } = await supabase
        .from('usuarios')
        .update({ referido_id: null })
        .eq('referido_id', id)
      
      if (referralsError) {
        console.error('Error cleaning referrals:', referralsError)
        throw new Error('Error al limpiar referencias: ' + referralsError.message)
      }
      
      // PASO 7: Finalmente eliminar el usuario
      const { error: userError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)
      
      if (userError) {
        console.error('Error deleting user:', userError)
        throw new Error('Error al eliminar usuario: ' + userError.message)
      }
      
      console.log('User permanently deleted successfully:', id)
      return true
      
    } catch (error) {
      console.error('Error in permanent deletion process:', error)
      throw error
    }
  }
}
