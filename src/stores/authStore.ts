import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['usuarios']['Row']

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ loading: false })
      return { error }
    }

    if (data.user) {
      // Fetch user data from our usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        set({ loading: false })
        return { error: userError }
      }

      set({ user: userData, loading: false })
    }

    return { error: null }
  },

  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ loading: true })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      set({ loading: false })
      return { error }
    }

    if (data.user) {
      // Create user record in our usuarios table
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          nombre: userData.nombre!,
          apellido: userData.apellido!,
          telefono: userData.telefono,
          rol: userData.rol || 'seller',
          balance: userData.balance || 0,
        })

      if (insertError) {
        set({ loading: false })
        return { error: insertError }
      }

      // Create wallet for the user
      const { error: walletError } = await supabase
        .from('billeteras')
        .insert({
          usuario_id: data.user.id,
          saldo: 0,
        })

      if (walletError) {
        console.error('Error creating wallet:', walletError)
      }

      set({ loading: false })
    }

    return { error: null }
  },

  signOut: async () => {
    set({ loading: true })
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error)
    }
    
    set({ user: null, loading: false })
  },
  

  refreshUser: async () => {
    set({ loading: true })

    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      set({ user: null, loading: false })
      return
    }

    // Fetch user data from our usuarios table
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
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

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, _session) => {
    const { refreshUser } = useAuthStore.getState()
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await refreshUser()
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ user: null, loading: false })
    }
  })
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
  }
}
