import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { hasRoleAccess } from '@/components/layout/data/sidebar-data'
import { type UserRole } from '@/components/layout/types'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const user = useAuthStore((state) => state.auth.user)
  const userRole: UserRole = user?.role || 'vendedor'

  const hasAccess = hasRoleAccess(userRole, allowedRoles)

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
} 