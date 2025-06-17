import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { Balance } from '@/components/layout/balance'
import { getSidebarData } from './data/sidebar-data'
import { useAuthStore } from '@/stores/authStore'
import { type UserRole } from './types'
import { RoleSwitcher } from '../role-switcher'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.auth.user)

  // Default to 'vendedor' if no user or role is available
  const userRole: UserRole = user?.role || 'vendedor'

  // Get role-based sidebar data
  const sidebarData = getSidebarData(userRole)

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
      <SidebarFooter>
        <RoleSwitcher />
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
