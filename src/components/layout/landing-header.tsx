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
import { useSearch } from '@/stores/searchStore'

export default function LandingHeader() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: billetera } = user ? useBilleteraByUsuario(user.id) : { data: null }
  const { searchInput, setSearchInput } = useSearch()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { data: categorias } = useCategorias()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const redirectRoute = user?.rol === 'admin' ? '/admin/apps' : user?.rol === 'provider' ? '/proveedor/reportes' : '/dashboard'
  return (
    <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 px-4 py-4 gap-4 bg-base-100 shadow">
      <div className='flex flex-row justify-between items-center w-full'>

        <Link to="/">
          <div className="flex items-center gap-2 ">
            <img src="https://img.icons8.com/?size=100&id=C1DUEYn7PMsS&format=png&color=000000" alt="ML+" className="h-8 w-8" />
            <h3 className='font-bold'>ML Streaming</h3>
          </div>
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
                  <Button onClick={() => navigate({ to: '/admin/apps' })} size="lg">
                    <IconLayoutDashboard />
                    Dashboard </Button>
                ) : user?.rol === 'provider' ? (
                  <Button onClick={() => navigate({ to: '/proveedor/reportes' })} size="lg">
                    <IconChartBar />
                    Reportes </Button>
                ) : (

                  <div className='flex items-center gap-2'>
                    <Button variant="ghost" className='text-xl font-bold' onClick={() => navigate({ to: '/dashboard' })} size="lg">
                      $ {billetera?.saldo.toFixed(2)}


                    </Button>
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
                    <Link to="/">
                      <div className="flex items-center gap-2 ">
                        <img src="https://img.icons8.com/?size=100&id=C1DUEYn7PMsS&format=png&color=000000" alt="ML+" className="h-8 w-8" />
                        <h3 className='font-bold'>ML Streaming</h3>
                      </div>
                    </Link>
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
    </nav>
  )
}