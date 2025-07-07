import Logo from '@/assets/logo.png'
import { useIsMobile } from '@/hooks/use-mobile'
import { useBilleteraByUsuario } from '@/queries'
import { useAuth } from '@/stores/authStore'
import { useSearch } from '@/stores/searchStore'
import { IconLayoutDashboard, IconPackage, IconShoppingBag, IconUser, IconWallet } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const rolRedirect = {
  admin: '/admin/reportes-globales',
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

        <Link to="/">

          <img src={Logo} alt="ML+" className='w-auto md:h-16 h-14 dark:invert' />


        </Link>
        <div className=" w-1/2 hidden md:block md:mx-8">
          <Input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
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
                        <span className='text-xs font-normal font-mono'>  {user.usuario}</span>
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