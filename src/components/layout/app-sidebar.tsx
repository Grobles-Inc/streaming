import { Balance } from '@/components/layout/balance'
import { NavGroup } from '@/components/layout/nav-group'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/authStore'
import { getSidebarData } from './data/sidebar-data'
import { type UserRole } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)

  // Default to 'seller' if no user or role is available
  const userRole: UserRole = user?.rol as UserRole || 'seller'

  // Get role-based sidebar data
  const sidebarData = getSidebarData(userRole, user)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <Balance />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
