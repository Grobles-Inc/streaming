import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { MappedUser } from '../data/schema'
import { useUsers as useSupabaseUsers } from '../hooks/use-users'
import { CreateUserData, UpdateUserData } from '../services/users.service'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete' | 'view' | 'changeRole'

interface UsersContextType {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: MappedUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<MappedUser | null>>
  // Datos y funciones de Supabase
  users: MappedUser[]
  loading: boolean
  error: string | null
  createUser: (userData: CreateUserData) => Promise<MappedUser | null>
  updateUser: (id: string, userData: UpdateUserData) => Promise<MappedUser | null>
  deleteUser: (id: string) => Promise<boolean>
  searchUsersByName: (name: string) => Promise<void>
  filterByRole: (role: 'admin' | 'provider' | 'seller' | 'registered') => Promise<void>
  updateUserBalance: (id: string, newBalance: number) => Promise<boolean>
  refreshUsers: () => void
  clearError: () => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function UsersProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<MappedUser | null>(null)
  
  // Usar el hook de Supabase
  const {
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
    clearError
  } = useSupabaseUsers()

  return (
    <UsersContext.Provider value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow,
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
      clearError
    }}>
      {children}
    </UsersContext.Provider>
  )
}

export const useUsersContext = () => {
  const context = React.useContext(UsersContext)
  if (!context) {
    throw new Error('useUsersContext must be used within UsersProvider')
  }
  return context
}
