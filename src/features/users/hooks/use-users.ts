import { useState, useEffect } from 'react'
import { UsersService, type CreateUserData, type UpdateUserData } from '../services/users.service'
import { mapSupabaseUserToComponent, type MappedUser } from '../data/schema'

export function useUsers() {
  const [users, setUsers] = useState<MappedUser[]>([])
  const [disabledUsers, setDisabledUsers] = useState<MappedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [disabledUsersLoading, setDisabledUsersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuarios inicial
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabaseUsers = await UsersService.getEnabledUsers()
      const mappedUsers = supabaseUsers.map(mapSupabaseUserToComponent)
      setUsers(mappedUsers)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDisabledUsers = async () => {
    try {
      setDisabledUsersLoading(true)
      const supabaseUsers = await UsersService.getDisabledUsers()
      const mappedUsers = supabaseUsers.map(mapSupabaseUserToComponent)
      setDisabledUsers(mappedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios deshabilitados')
      console.error('Error loading disabled users:', err)
    } finally {
      setDisabledUsersLoading(false)
    }
  }

  const createUser = async (userData: CreateUserData): Promise<MappedUser | null> => {
    try {
      const newUser = await UsersService.createUser(userData)
      // Después de crear, obtenemos el usuario completo con billetera
      const userWithWallet = await UsersService.getUserById(newUser.id)
      if (userWithWallet) {
        const mappedUser = mapSupabaseUserToComponent(userWithWallet)
        setUsers(prev => [mappedUser, ...prev])
        return mappedUser
      }
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario'
      console.error('Error creating user:', err)
      console.error('User data sent:', userData)
      setError(errorMessage)
      return null
    }
  }

  const updateUser = async (id: string, userData: UpdateUserData): Promise<MappedUser | null> => {
    try {
      await UsersService.updateUser(id, userData)
      // Después de actualizar, obtenemos el usuario completo con billetera
      const userWithWallet = await UsersService.getUserById(id)
      if (userWithWallet) {
        const mappedUser = mapSupabaseUserToComponent(userWithWallet)
        setUsers(prev => prev.map(u => u.id === id ? mappedUser : u))
        return mappedUser
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario')
      console.error('Error updating user:', err)
      return null
    }
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await UsersService.deleteUser(id)
      // Remover de la lista de usuarios habilitados
      setUsers(prev => prev.filter(u => u.id !== id))
      // Si ya tenemos usuarios deshabilitados cargados, añadir el usuario a esa lista
      const userWithWallet = await UsersService.getUserById(id)
      if (userWithWallet && !userWithWallet.estado_habilitado) {
        const mappedUser = mapSupabaseUserToComponent(userWithWallet)
        setDisabledUsers(prev => [mappedUser, ...prev])
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al deshabilitar usuario')
      console.error('Error disabling user:', err)
      return false
    }
  }

  const enableUser = async (id: string): Promise<boolean> => {
    try {
      await UsersService.enableUser(id)
      // Obtener el usuario actualizado
      const userWithWallet = await UsersService.getUserById(id)
      if (userWithWallet && userWithWallet.estado_habilitado) {
        const mappedUser = mapSupabaseUserToComponent(userWithWallet)
        // Añadir a la lista de usuarios habilitados
        setUsers(prev => [mappedUser, ...prev])
        // Remover de la lista de usuarios deshabilitados
        setDisabledUsers(prev => prev.filter(u => u.id !== id))
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al habilitar usuario')
      console.error('Error enabling user:', err)
      return false
    }
  }

  const searchUsersByName = async (name: string) => {
    try {
      setLoading(true)
      const supabaseUsers = await UsersService.searchUsersByName(name)
      const mappedUsers = supabaseUsers.map(mapSupabaseUserToComponent)
      setUsers(mappedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar usuarios')
      console.error('Error searching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterByRole = async (role: 'admin' | 'provider' | 'seller' | 'registered') => {
    try {
      setLoading(true)
      const supabaseUsers = await UsersService.filterByRole(role)
      const mappedUsers = supabaseUsers.map(mapSupabaseUserToComponent)
      setUsers(mappedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar usuarios')
      console.error('Error filtering users:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateUserBalance = async (id: string, newBalance: number): Promise<boolean> => {
    try {
      await UsersService.updateUserBalance(id, newBalance)
      // Después de actualizar, obtenemos el usuario completo con billetera
      const userWithWallet = await UsersService.getUserById(id)
      if (userWithWallet) {
        const mappedUser = mapSupabaseUserToComponent(userWithWallet)
        setUsers(prev => prev.map(u => u.id === id ? mappedUser : u))
      }
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar balance')
      console.error('Error updating balance:', err)
      return false
    }
  }

  const refreshUsers = () => {
    loadUsers()
  }

  const permanentDeleteUser = async (id: string): Promise<boolean> => {
    try {
      await UsersService.permanentDeleteUser(id)
      // Remover de la lista de usuarios deshabilitados
      setDisabledUsers(prev => prev.filter(u => u.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario permanentemente')
      console.error('Error permanently deleting user:', err)
      return false
    }
  }

  return {
    users,
    disabledUsers,
    loading,
    disabledUsersLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    enableUser,
    searchUsersByName,
    filterByRole,
    updateUserBalance,
    refreshUsers,
    loadDisabledUsers,
    clearError: () => setError(null),
    permanentDeleteUser
  }
}
