import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { IconLogout, IconMoon, IconSun, IconUser } from '@tabler/icons-react'
import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/stores/authStore'
import { useTheme } from '@/context/theme-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from './ui/sidebar'

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
        <Button
          variant='ghost'
          className='w-full justify-start group-data-[collapsible=icon]:justify-center'
        >
          <Avatar className='size-6'>
            <AvatarImage src='https://img.icons8.com/?size=200&id=492ILERveW8G&format=png&color=000000' />
            <AvatarFallback className='bg-gradient-to-r from-indigo-500 to-cyan-500 text-white'></AvatarFallback>
          </Avatar>
          <span className='font-medium group-data-[collapsible=icon]:hidden'>
            {user?.nombres} {user?.apellidos.slice(0, 10)}
          </span>
          <ChevronRight className='ml-auto hidden transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>{user?.nombres}</p>
            <p className='text-muted-foreground text-xs leading-none'>
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to='/settings'>
            Perfil
            <DropdownMenuShortcut>
              <IconUser />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
        <DropdownMenuItem onClick={toggleSidebar}>
          {state === 'expanded' ? 'Expandir' : 'Colapsar'}
          <DropdownMenuShortcut>Ctrl + B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onClick={() => signOut()}>
          Cerrar sesión
          <DropdownMenuShortcut>
            <IconLogout />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
