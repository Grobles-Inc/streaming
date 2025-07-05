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

  // Validar código de referido y obtener usuario referente
  static async validateReferralCode(codigo: string): Promise<SupabaseUser | null> {
    if (!codigo || codigo.trim() === '') {
      return null
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('codigo_referido', codigo.trim())
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
      
      // PASO 1: Crear el usuario SIN billetera_id pero CON referido_id
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
      
      // PASO 1A: Crear el usuario en Supabase Auth usando signUp normal
      const { data: authSignUp, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '', // Asegurar que no sea undefined
        options: {
          data: {
            nombres: userData.nombres,
            apellidos: userData.apellidos,
            usuario: userData.usuario,
            rol: userData.rol || 'registered'
          }
        }
      })

      if (authError) {
        console.error('Error creating auth user:', authError)
        throw authError
      }

      if (!authSignUp.user) {
        throw new Error('No se pudo crear el usuario en Auth')
      }

      console.log('Auth user created successfully:', authSignUp.user.id)
      
      // PASO 1B: Crear el usuario en la tabla usuarios con el ID de Auth
      const userInsertDataWithAuth = {
        ...userInsertData,
        id: authSignUp.user.id // Usar el ID generado por Auth
      }
      
      const { data: userData_inserted, error: userError } = await supabase
        .from('usuarios')
        .insert(userInsertDataWithAuth)
        .select('*')
        .single()
      
      if (userError) {
        console.error('Error creating user with referral:', userError)
        // Limpiar el usuario de Auth si falla la creación en la tabla
        // Nota: Con signUp no podemos usar admin.deleteUser, pero el usuario de Auth quedará sin datos en la tabla
        console.warn('Usuario creado en Auth pero falló en la tabla usuarios:', authSignUp.user.id)
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
        // Si falla la creación de la billetera, eliminar el usuario de la tabla
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', userData_inserted.id)
        
        // Nota: Con signUp no podemos eliminar el usuario de Auth fácilmente
        console.warn('Usuario creado en Auth pero falló la billetera:', userData_inserted.id)
          
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
        console.error('Error updating user with wallet ID:', updateError)
        throw updateError
      }
      
      // IMPORTANTE: Cerrar la sesión del usuario recién creado para que el formulario pueda hacer login
      await supabase.auth.signOut()
      console.log('Sesión cerrada para permitir login desde el formulario')
      
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
}
