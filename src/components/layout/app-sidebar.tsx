import { useBilleteraByUsuario } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { BalanceSummary } from '@/components/layout/balance-summary'
import { NavGroup } from '@/components/layout/nav-group'
import { UserNav } from '../user-nav'
import { getSidebarData } from './data/sidebar-data'
import { type UserRole } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const monto = billetera?.saldo || 0
  const userRole: UserRole = (user?.rol as UserRole) || 'seller'
  const sidebarData = getSidebarData(userRole, user)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      {userRole !== 'admin' ? (
        <SidebarHeader>
          <div className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2'>
            <img
              src='https://img.icons8.com/?size=100&id=Yo9kOcztQ9xn&format=png&color=000000'
              alt='Wallet'
              className='size-10 transition-all duration-200 ease-in-out group-data-[collapsible=icon]:size-7'
            />
            <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
              <span className='truncate text-lg font-semibold'>
                $ {monto.toFixed(2)}
              </span>
              <span className='truncate text-xs'>Saldo Actual</span>
            </div>
          </div>
        </SidebarHeader>
      ) : (
        <BalanceSummary />
      )}
      <SidebarContent className='space-y-4'>
        {/* Navegación */}
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
