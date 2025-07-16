import Logo from '@/assets/logo.png'
import { useIsMobile } from '@/hooks/use-mobile'
import { useBilleteraByUsuario } from '@/queries'
import { useAuth } from '@/stores/authStore'
import { useSearch } from '@/stores/searchStore'
import { IconLayoutDashboard, IconPackage, IconSearch, IconShoppingBag, IconUser, IconWallet } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
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
  const redirectRoute = rolRedirect[user?.rol as keyof typeof rolRedirect] || '/dashboard'
  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 px-4 py-4 gap-4 bg-base-100 shadow">
      <div className='flex flex-row justify-between items-center w-full'>
        <div className='flex justify-between items-center w-full md:w-auto'>

          <Link to="/">

            <img src={Logo} alt="ML+" className='w-auto md:h-16 h-14 dark:invert' />


          </Link>

          {
            !user && (

              <Button variant="outline" className='md:hidden' size="icon" onClick={() => navigate({ to: '/sign-in' })}>
                <IconUser />
              </Button>)}

        </div>

        <div className="*:not-first:mt-2 w-1/2 md:block hidden ">
          <div className="relative">
            <Input id="search" className="peer pe-9" placeholder="¿Qué estás buscando?" type="email" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 peer-disabled:opacity-50">
              <IconSearch size={16} aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="md:flex items-center gap-4 hidden ">
          {user && !isMobile ? (
            <div className='flex items-center gap-2'>
              {
                user?.rol === 'admin' ? (
                  <Button onClick={() => navigate({ to: '/admin/reportes-globales' })} size="lg">
                    <IconLayoutDashboard />
                    Admin </Button>
                ) : user?.rol === 'provider' ? (
                  <Button onClick={() => navigate({ to: '/proveedor/productos' })} size="lg">
                    <IconPackage />
                    Admin </Button>
                ) : user?.rol === 'registered' ? null : (
                  <div className='flex items-center gap-2'>
                    <div className='text-xl flex flex-col gap-0 items-center mx-4 font-bold' >
                      $ {billetera?.saldo.toFixed(2)}
                      <div className='flex gap-1 items-center'>
                        <IconUser size={16} />
                        <div className='flex flex-col gap-0'>

                          <span className='text-xs font-normal font-mono'>  {user.usuario}</span>
                          <span className='text-xs font-normal font-mono'>  {user.codigo_referido}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => navigate({ to: '/compras' })} className='flex items-center gap-2'>
                      <IconShoppingBag />
                      Compras</Button>
                    <Button variant="secondary" onClick={() => navigate({ to: '/recargas' })} className='flex items-center gap-2'>
                      <IconWallet />
                      Recargas</Button>
                  </div>
                )
              }

              <Button variant="destructive" onClick={() => signOut()} className='flex items-center gap-2'>
                Salir</Button>
            </div>
          ) : (
            <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
          )}
        </div>
        {isMobile && (
          user && user.rol !== 'registered' && (
            <Button size="icon" onClick={() => navigate({ to: redirectRoute })}>
              <IconUser />
            </Button>
          )
        )}
      </div>
      <div className="flex-1 md:hidden md:mx-8">
        <Input
          type="text"
          placeholder="¿Qué estás buscando?"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
    </nav>
  )
}