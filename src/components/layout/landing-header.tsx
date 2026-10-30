import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  IconLayoutDashboard,
  IconMoon,
  IconPackage,
  IconShoppingBag,
  IconSun,
  IconUser,
  IconWallet,
} from '@tabler/icons-react'
import { useBilleteraByUsuario } from '@/queries'
import ComprasCuentaDialog from '@/features/vendedor/compras/components/compras-cuenta-dialog'
import { ComprasNotificacionesBell } from '@/features/vendedor/compras/components/compras-notificaciones-bell'
import type { CompraCuentaActualizada } from '@/features/vendedor/compras/services'
import Logo from '@/assets/logo.png'
import { useAuth } from '@/stores/authStore'
import { useTheme } from '@/context/theme-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '../ui/button'

export default function LandingHeader() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const isMobile = useIsMobile()
  const [cuentaCompra, setCuentaCompra] =
    useState<CompraCuentaActualizada | null>(null)
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }
  return (
    <nav className='bg-base-100 flex flex-col gap-4 px-4 py-4 shadow md:flex-row md:items-center md:justify-between md:px-6'>
      <div className='flex w-full flex-col items-center gap-2 md:flex-row md:items-center md:justify-between md:gap-0'>
        <div className='flex items-center gap-2 md:w-auto'>
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
              size='icon'
              onClick={() => navigate({ to: '/sign-in' })}
            >
              <IconUser />
            </Button>
          )}
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
                  Admin
                </Button>
              ) : user?.rol === 'provider' ? (
                <Button
                  onClick={() => navigate({ to: '/proveedor/productos' })}
                  size='lg'
                >
                  <IconPackage />
                  Admin
                </Button>
              ) : user?.rol === 'registered' ? null : (
                <div className='flex items-center gap-2'>
                  {user.rol === 'seller' && (
                    <>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={toggleTheme}
                        aria-label='Cambiar tema'
                      >
                        {theme === 'light' ? (
                          <IconMoon className='size-4' />
                        ) : (
                          <IconSun className='size-4' />
                        )}
                      </Button>
                      <ComprasNotificacionesBell
                        vendedorId={user.id}
                        onSelectCompra={setCuentaCompra}
                      />
                    </>
                  )}
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
                    $ {billetera?.saldo.toFixed(2)}
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <Button onClick={() => navigate({ to: '/sign-in' })}>
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>

      {isMobile && user && user.rol === 'seller' && (
        <div className='flex items-center justify-center gap-2 w-full mt-2 md:hidden'>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            aria-label='Cambiar tema'
          >
            {theme === 'light' ? (
              <IconMoon className='size-4' />
            ) : (
              <IconSun className='size-4' />
            )}
          </Button>
          <ComprasNotificacionesBell
            vendedorId={user.id}
            onSelectCompra={setCuentaCompra}
          />
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
            $ {billetera?.saldo.toFixed(2)}
          </Button>
        </div>
      )}
      <ComprasCuentaDialog
        compra={cuentaCompra}
        open={!!cuentaCompra}
        onOpenChange={(open) => {
          if (!open) setCuentaCompra(null)
        }}
      />
    </nav>
  )
}
