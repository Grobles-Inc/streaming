import { IconDashboard, IconUser } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export default function LandingHeader() {
  const navigate = useNavigate()
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
          <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>Dashboard</Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Button size="icon" variant="outline" onClick={() => navigate({ to: '/sign-in' })}><IconUser /></Button>
          <Button size="icon" variant="outline" onClick={() => navigate({ to: '/dashboard' })}><IconDashboard /></Button>
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
