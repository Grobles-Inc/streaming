import { useBilleteraByUsuario } from '@/queries'
import { useAuth } from '@/stores/authStore'
import { IconLogout, IconShoppingBag, IconWallet } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function LandingHeader() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: billetera } = user ? useBilleteraByUsuario(user.id) : { data: null }
  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 px-4 py-4 gap-4 bg-base-100 shadow">
      <div className='flex flex-row justify-between items-center w-full'>

        <Link to="/">
          <div className="flex flex-col items-center ">
            <span className="text-2xl font-bold ">Dark<span className="text-red-500 font-bold text-lg">+</span></span>

            <span className="text-xs text-gray-500 ml-1">STREAMING</span>
          </div>
        </Link>
        <div className=" w-1/2 hidden md:block md:mx-8">
          <Input
            type="text"
            placeholder="¿Qué estás buscando?"
          />
        </div>
        <div className="md:flex items-center gap-4 hidden ">
          {user ? (
            <div className='flex items-center gap-2'>
              <Button onClick={() => navigate({ to: '/dashboard' })} size="lg">
                <IconWallet />
                $ {billetera?.saldo} </Button>
              <Button variant="secondary" onClick={() => navigate({ to: '/compras' })} className='flex items-center gap-2'>
                <IconShoppingBag />
                Mis Compras</Button>
              <Button variant="outline" onClick={() => navigate({ to: '/recargas' })} className='flex items-center gap-2'>
                <IconWallet />
                Mis Recargas</Button>
              <Button variant="destructive" onClick={() => signOut()} className='flex items-center gap-2'>
                <IconLogout />
                Cerrar Sesión</Button>
            </div>
          ) : (
            <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
          )}
        </div>
      </div>
      <div className="flex-1 md:hidden md:mx-8">
        <Input
          type="text"
          placeholder="¿Qué estás buscando?"
        />
      </div>
    </nav>
  )
}
