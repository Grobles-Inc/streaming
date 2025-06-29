import { useBilleteraByUsuario } from '@/queries'
import { useAuth } from '@/stores/authStore'
import { IconChartBar, IconLayoutDashboard, IconLogout, IconMenu, IconShoppingBag, IconUser, IconWallet } from '@tabler/icons-react'
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
  const { data: categorias } = useCategorias()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const redirectRoute = user?.rol === 'admin' ? '/admin/apps' : user?.rol === 'provider' ? '/proveedor/reportes' : '/dashboard'
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
          {user && !isMobile ? (
            <div className='flex items-center gap-2'>
              {
                user?.rol === 'admin' ? (
                  <Button onClick={() => navigate({ to: '/admin/apps' })} size="lg">
                    <IconLayoutDashboard />
                    Dashboard </Button>
                ) : user?.rol === 'provider' ? (
                  <Button onClick={() => navigate({ to: '/proveedor/reportes' })} size="lg">
                    <IconChartBar />
                    Reportes </Button>
                ) : (

                  <div className='flex items-center gap-2'>
                    <Button variant="ghost" className=' font-bold text-xl' onClick={() => navigate({ to: '/dashboard' })} size="lg">
                      $ {billetera?.saldo || 0} </Button>
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
                <IconLogout />
                Salir</Button>
            </div>
          ) : (
            <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
          )}
        </div>
        {isMobile && (
          <div className='flex items-center gap-2'>
            {
              user ? (
                <Button variant="outline" onClick={() => navigate({ to: redirectRoute })}>
                  <IconUser />
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate({ to: '/sign-in' })}>
                  <IconUser />
                </Button>
              )
            }
            <div className="sm:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" >
                    <IconMenu />
                  </Button>

                </SheetTrigger>
                <SheetContent className='p-4' side="left">
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-black">Wolf</span>
                      <span className="text-red-500 font-bold text-lg">+</span>
                      <span className="text-xs text-gray-500 ml-1">STREAMING</span>
                    </div>
                  </SheetTitle>
                  <SheetDescription>
                    Selecciona una categoría para ver los productos disponibles.
                  </SheetDescription>
                  <div className="flex flex-col gap-2 mt-8">
                    {categorias?.data.map((categoria) => (
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

          </div>
        )}

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
