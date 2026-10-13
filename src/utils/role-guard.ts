import { useAuthStore } from '@/stores/authStore'
import { redirect } from '@tanstack/react-router'
import type { UserRole } from '@/components/layout/types'

export function requireRole(allowedRoles: UserRole[]) {
  const user = useAuthStore.getState().user
  // `usuarios.rol` es `text` en la BD, así que se compara contra los roles
  // permitidos en vez de forzar el tipo.
  if (!user || !allowedRoles.some((role) => role === user.rol)) {
    throw redirect({ to: '/403' })
  }
} 