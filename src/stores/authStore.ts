import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['usuarios']['Row']

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (usuario: string, password: string) => Promise<{ error: any }>
  signUp: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}



export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  loading: true,

  signIn: async (usuario: string, password: string) => {
    set({ loading: true })
    
    try {
      // Find user by username
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario)
        .single()

      if (error || !userData) {
        set({ loading: false })
        return { error: { message: 'Usuario no encontrado' } }
      }

      // Verify password
      if ( !userData.password || userData.password !== password) {
        set({ loading: false })
        return { error: { message: 'Contraseña incorrecta' } }
      }

      // Store user session in localStorage
      localStorage.setItem('currentUserId', userData.id)
      
      set({ user: userData, loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: err }
    }
  },

  signUp: async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    set({ loading: true })

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id')
        .or(`usuario.eq.${userData.usuario},email.eq.${userData.email}`)
        .single()

      if (existingUser) {
        set({ loading: false })
        return { error: { message: 'Usuario o email ya existe' } }
      }


      // Create user record
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert({
          ...userData,
          password: userData.password || '',
        })
        .select()
        .single()

      if (error) {
        set({ loading: false })
        return { error }
      }

      // Create wallet for the user
      const { error: walletError } = await supabase
        .from('billeteras')
        .insert({
          usuario_id: newUser.id,
          saldo: 0,
        })

      if (walletError) {
        console.error('Error creating wallet:', walletError)
      }

      set({ loading: false })
      return { error: null }
    } catch (err) {
      set({ loading: false })
      return { error: err }
    }
  },

  signOut: async () => {
    set({ loading: true })
    
    // Remove session from localStorage
    localStorage.removeItem('currentUserId')
    
    set({ user: null, loading: false })
  },

  refreshUser: async () => {
    set({ loading: true })

    // Get current user ID from localStorage
    const currentUserId = localStorage.getItem('currentUserId')

    if (!currentUserId) {
      set({ user: null, loading: false })
      return
    }

    // Fetch user data from usuarios table
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', currentUserId)
      .single()

    if (userError || !userData) {
      console.error('Error fetching user data:', userError)
      localStorage.removeItem('currentUserId')
      set({ user: null, loading: false })
      return
    }

    set({ user: userData, loading: false })
  },
}))

// Initialize auth state on app load
export const initializeAuth = async () => {
  const { refreshUser } = useAuthStore.getState()
  await refreshUser()
}

// Custom hook for easier usage
export const useAuth = () => {
  const { user, loading, signIn, signUp, signOut, refreshUser } = useAuthStore()
  
  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isProvider: user?.rol === 'provider',
    isSeller: user?.rol === 'seller',
    isRegistered: user?.rol === 'registered',
  }
}
