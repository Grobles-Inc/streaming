import { useBilleteraByUsuario } from '@/queries'
import { useAuth } from '@/stores/authStore'
import {  IconLayoutDashboard, IconLogout, IconMenu, IconUser, IconWallet } from '@tabler/icons-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../ui/sheet'
import { useCategorias } from '@/features/landing/queries'

export default function LandingHeader() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  // Validación adicional
  const categoriasData = categorias?.data || []
  
  const redirectRoute = user?.rol === 'admin' ? '/admin/apps' : user?.rol === 'provider' ? '/proveedor/reportes' : '/dashboard'

  const handleLogout = () => {
    signOut()
    navigate({ to: '/sign-in' })
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex">
            <Link
              to="/"
              className="mr-4 flex items-center space-x-2 lg:mr-6"
            >
              <img src="/images/streamingweb.png" alt="StreamingWeb" className="h-8 w-8" />
              <span className="hidden font-bold lg:inline-block">
                StreamingWeb
              </span>
            </Link>
          </div>

          <div className="flex-1 hidden md:mx-8 md:block">
            <Input
              type="text"
              placeholder="¿Qué estás buscando?"
            />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to={redirectRoute}>
                    <IconLayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                
                <div className="flex items-center space-x-2">
                  <IconWallet className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    ${billetera?.saldo?.toFixed(2) || '0.00'}
                  </span>
                </div>

                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <IconLogout className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/sign-in">
                    <IconUser className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>

          {isMobile && (
            <div className="ml-4">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <IconMenu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetTitle>
                    <Link
                      to="/"
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <img src="/images/streamingweb.png" alt="StreamingWeb" className="h-8 w-8" />
                      <span className="font-bold">StreamingWeb</span>
                    </Link>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Menu de navegación
                  </SheetDescription>
                  
                  <div className="flex flex-col gap-2 mt-8">
                    {!loadingCategorias && categoriasData.map((categoria) => (
                      <Button
                        key={categoria.id}
                        variant={activeTab === categoria.id ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => {
                          setActiveTab(categoria.id)
                          navigate({ to: '/categoria/$name', params: { name: categoria.nombre.toLowerCase() } })
                          setIsOpen(false)
                        }}
                      >
                        {categoria.nombre}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
        {isMobile && (
          <div className="flex-1 md:hidden md:mx-8">
            <Input
              type="text"
              placeholder="¿Qué estás buscando?"
            />
          </div>
        )}
      </div>
    </nav>
  )
}
