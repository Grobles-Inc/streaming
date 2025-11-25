import { Link, useNavigate } from '@tanstack/react-router'
import {
  IconLayoutDashboard,
  IconPackage,
  IconSearch,
  IconShoppingBag,
  IconUser,
  IconWallet,
} from '@tabler/icons-react'
import { useBilleteraByUsuario } from '@/queries'
import Logo from '@/assets/logo.png'
import { useAuth } from '@/stores/authStore'
import { useSearch } from '@/stores/searchStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const rolRedirect = {
  admin: '/admin/recargas',
  provider: '/proveedor/productos',
  user: '/dashboard',
  registrado: '/settings',
}

export default function LandingHeader() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const { searchInput, setSearchInput } = useSearch()
  const isMobile = useIsMobile()
  const redirectRoute =
    rolRedirect[user?.rol as keyof typeof rolRedirect] || '/dashboard'
  return (
    <nav className='bg-base-100 flex flex-col gap-4 px-4 py-4 shadow md:flex-row md:items-center md:justify-between md:px-6'>
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='flex w-full items-center justify-between md:w-auto'>
          <Link to='/'>
            <img
              src={Logo}
              alt='ML+'
              className='h-14 w-auto md:h-16 dark:invert'
            />
          </Link>

          {!user && (
            <Button
              variant='outline'
              className='md:hidden'
              size='icon'
              onClick={() => navigate({ to: '/sign-in' })}
            >
              <IconUser />
            </Button>
          )}
        </div>

        <div className='hidden w-1/2 *:not-first:mt-2 md:block'>
          <div className='relative'>
            <Input
              id='search'
              className='peer pe-9'
              placeholder='¿Qué estás buscando?'
              type='email'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50'>
              <IconSearch size={16} aria-hidden='true' />
            </div>
          </div>
        </div>
        <div className='hidden items-center gap-4 md:flex'>
          {user && !isMobile ? (
            <div className='flex items-center gap-2'>
              {user?.rol === 'admin' ? (
                <Button
                  onClick={() => navigate({ to: '/admin/recargas' })}
                  size='lg'
                >
                  <IconLayoutDashboard />
                  Admin{' '}
                </Button>
              ) : user?.rol === 'provider' ? (
                <Button
                  onClick={() => navigate({ to: '/proveedor/productos' })}
                  size='lg'
                >
                  <IconPackage />
                  Admin{' '}
                </Button>
              ) : user?.rol === 'registered' ? null : (
                <div className='flex items-center gap-2'>
                  <div className='mx-4 flex flex-col items-center gap-0 text-xl font-bold'>
                    $ {billetera?.saldo.toFixed(2)}
                    <div className='flex items-center gap-1'>
                      <IconUser size={16} />
                      <div className='flex flex-col gap-0'>
                        <span className='font-mono text-xs font-normal'>
                          {' '}
                          {user.usuario}
                        </span>
                        <span className='font-mono text-xs font-normal'>
                          {' '}
                          {user.codigo_referido}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant='secondary'
                    onClick={() => navigate({ to: '/compras' })}
                    className='flex items-center gap-2'
                  >
                    <IconShoppingBag />
                    Compras
                  </Button>
                  <Button
                    variant='secondary'
                    onClick={() => navigate({ to: '/recargas' })}
                    className='flex items-center gap-2'
                  >
                    <IconWallet />
                    Recargas
                  </Button>
                </div>
              )}

              <Button
                variant='destructive'
                onClick={() => signOut()}
                className='flex items-center gap-2'
              >
                Salir
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate({ to: '/sign-in' })}>
              Iniciar Sesión
            </Button>
          )}
        </div>
        {isMobile && user && user.rol !== 'registered' && (
          <Button size='icon' onClick={() => navigate({ to: redirectRoute })}>
            <IconUser />
          </Button>
        )}
      </div>
      <div className='flex-1 md:mx-8 md:hidden'>
        <Input
          type='text'
          placeholder='¿Qué estás buscando?'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
    </nav>
  )
}
