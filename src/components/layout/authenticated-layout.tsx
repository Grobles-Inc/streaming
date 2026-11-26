import Cookies from 'js-cookie'
import { Navigate, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { BottomTabs } from '@/components/layout/bottom-tabs'
import { getBottomTabs } from '@/components/layout/data/sidebar-data'
import { type UserRole } from '@/components/layout/types'
import SkipToMain from '@/components/skip-to-main'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const { isAuthenticated, user } = useAuth()
  const bottomTabs = user?.rol
    ? getBottomTabs(user.rol as UserRole)
    : null
  if (!isAuthenticated) {
    return <Navigate to='/sign-in' />
  }
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <SidebarTrigger
            className={cn(
              'mt-2 ml-2 scale-125 sm:scale-100 md:hidden',
              bottomTabs && 'hidden'
            )}
          />
          {children ? children : <Outlet />}
          {bottomTabs && (
            <>
              <div className='h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 md:hidden' />
              <BottomTabs tabs={bottomTabs.tabs} more={bottomTabs.more} />
            </>
          )}
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
