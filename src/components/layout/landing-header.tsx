import { useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Link } from '@tanstack/react-router'

export default function LandingHeader() {
  const navigate = useNavigate()
  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 px-4 py-4 gap-4 bg-base-100 shadow">
      <Link to="/">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-black">Wolf</span>
          <span className="text-red-500 font-bold text-lg">+</span>
          <span className="text-xs text-gray-500 ml-1">STREAMING</span>
        </div>
      </Link>
      <div className="flex-1 md:mx-8">
        <Input
          type="text"
          placeholder="¿Qué estás buscando?"
        />
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
        <Button variant="outline" onClick={() => navigate({ to: '/apps' })}>Dashboard</Button>
      </div>
    </nav>
  )
}
