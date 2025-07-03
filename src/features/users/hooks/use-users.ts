import { useState, useEffect } from 'react'
import { UsersService, type CreateUserData, type UpdateUserData } from '../services/users.service'
import { mapSupabaseUserToComponent, type MappedUser } from '../data/schema'

export function useUsers() {
  const [users, setUsers] = useState<MappedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuarios inicial
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const supabaseUsers = await UsersService.getUsers()
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
      setUsers(prev => prev.filter(u => u.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
      console.error('Error deleting user:', err)
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

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    searchUsersByName,
    filterByRole,
    updateUserBalance,
    refreshUsers,
    clearError: () => setError(null)
  }
}
