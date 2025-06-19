import { useAuthStore } from '@/stores/authStore'
import { getSidebarData, hasRoleAccess } from '@/components/layout/data/sidebar-data'
import { type UserRole } from '@/components/layout/types'

export const useRoleNavigation = () => {
  const user = useAuthStore((state) => state.user)
  const userRole: UserRole = user?.rol as UserRole || 'seller'
  
  const sidebarData = getSidebarData(userRole, user)
  
  const hasAccess = (allowedRoles?: UserRole[]) => {
    return hasRoleAccess(userRole, allowedRoles)
  }
  
  return {
    userRole,
    sidebarData,
    hasAccess,
    user: sidebarData.user,
    navGroups: sidebarData.navGroups,
  }
} 