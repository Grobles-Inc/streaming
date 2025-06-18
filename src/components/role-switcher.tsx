import { type UserRole } from '@/components/layout/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'

const roles: { value: UserRole; label: string }[] = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'admin', label: 'Admin' },
]

export function RoleSwitcher() {
  const { user, setUser } = useAuthStore((state) => state.auth)
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'vendedor')

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole)
    if (user) {
      setUser({
        ...user,
        role: newRole,
      })
    } else {
      // Create a mock user for demo purposes
      setUser({
        id: '1',
        accountNo: 'DEMO001',
        email: 'demo@example.com',
        role: newRole,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      })
    }
  }

  return (
    <div className='flex items-center gap-2 w-full justify-between data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
      <span className="text-sm font-medium truncate">Rol Usuario:</span>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-32 truncate">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

    </div>
  )
} 