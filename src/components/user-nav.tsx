import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  IconLayoutNavbarCollapse,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from '@tabler/icons-react'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/stores/authStore'
import { useTheme } from '@/context/theme-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from './ui/sidebar'

export function UserNav() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { state, toggleSidebar } = useSidebar()

  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <SidebarMenuButton>
          <Avatar className='size-6'>
            <AvatarImage src='https://img.icons8.com/?size=200&id=492ILERveW8G&format=png&color=000000' />
            <AvatarFallback className='bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'></AvatarFallback>
          </Avatar>
          {user?.usuario}
          <ChevronRight className='ml-auto hidden transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90' />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' forceMount>
        <DropdownMenuItem asChild>
          <Link to='/settings'>
            <IconUser />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'light' ? (
            <IconMoon className='size-4' />
          ) : (
            <IconSun className='size-4' />
          )}
          {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleSidebar}>
          <IconLayoutNavbarCollapse />
          {state === 'expanded' ? 'Expandir' : 'Colapsar'}
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onClick={() => signOut()}>
          <IconLogout />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
