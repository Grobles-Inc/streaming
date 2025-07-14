import { NavGroup } from '@/components/layout/nav-group'
import { BalanceSummary } from '@/components/layout/balance-summary'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'
import { useBilleteraByUsuario } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { Wallet } from 'lucide-react'
import { getSidebarData } from './data/sidebar-data'
import { type UserRole } from './types'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const monto = billetera?.saldo || 0
  const userRole: UserRole = user?.rol as UserRole || 'seller'
  const sidebarData = getSidebarData(userRole, user)

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      {userRole !== 'admin' ? <SidebarHeader>
        <div
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2 '
        >
          <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
            <Wallet className='size-5' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold text-lg'>
              $ {monto.toFixed(2)}
            </span>
            <span className='truncate text-xs'>Saldo Actual</span>
          </div>
        </div>
      </SidebarHeader> : <BalanceSummary />}
      <SidebarContent className="space-y-4">

        {/* Navegación */}
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
