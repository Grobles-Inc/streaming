import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { IconMoon, IconSun, IconUser } from '@tabler/icons-react'
import { useAuth } from '@/stores/authStore'
import { useTheme } from '@/context/theme-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from './ui/sidebar'

export function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

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
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='https://img.icons8.com/?size=200&id=492ILERveW8G&format=png&color=000000' />
            <AvatarFallback className='bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'>
              {user?.usuario?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuItem asChild>
          <Link to='/settings'>
            Perfil
            <DropdownMenuShortcut>
              <IconUser />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          <DropdownMenuShortcut>
            {theme === 'light' ? (
              <IconMoon className='size-4' />
            ) : (
              <IconSun className='size-4' />
            )}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <SidebarTrigger />
          Colapsar
        </DropdownMenuItem>
        <DropdownMenuItem variant='destructive' onClick={() => signOut()}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
