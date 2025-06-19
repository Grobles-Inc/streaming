import { useAuthStore } from '@/stores/authStore'
import { redirect } from '@tanstack/react-router'
import type { UserRole } from '@/components/layout/types'

export function requireRole(allowedRoles: UserRole[]) {
  const user = useAuthStore.getState().user
  if (!user || !allowedRoles.includes(user.rol)) {
    throw redirect({ to: '/403' })
  }
} 