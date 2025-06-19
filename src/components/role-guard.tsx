import { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { hasRoleAccess } from '@/components/layout/data/sidebar-data'
import { type UserRole } from '@/components/layout/types'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuthStore()
  const userRole: UserRole = user?.rol || 'seller'
  const hasAccess = hasRoleAccess(userRole, allowedRoles)
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasAccess && !fallback) {
      navigate({ to: '/403', replace: true })
    }
  }, [hasAccess, fallback, navigate])

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
} 