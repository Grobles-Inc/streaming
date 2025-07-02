import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/stores/authStore'
import { IconRefresh, IconHeadphones, IconAlertCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { SoporteTable } from './components/soporte-table'
import { columns } from './components/soporte-columns.tsx'
import { SoporteModal } from './components/soporte-modal.tsx'
import { useSoporteByProveedor } from './queries/soporte-queries'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export type SoporteEstado = 'activo' | 'resuelto' | 'soporte'

export interface SoporteCompra {
  id: string
  proveedor_id: string
  producto_id: string
  vendedor_id: string | null
  stock_producto_id: number | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado: string
  soporte_mensaje: string | null
  soporte_asunto: string | null
  soporte_respuesta: string | null
  created_at: string
  updated_at: string
  productos: {
    nombre: string
    precio_publico: number
  } | null
  usuarios: {
    nombres: string
    apellidos: string
    telefono: string | null
  } | null
  stock_productos: {
    id: number
    soporte_stock_producto: SoporteEstado
    email: string | null
    clave: string | null
    perfil: string | null
  } | null
}

export function SoportePage() {
  const { user } = useAuth()
  const [selectedCompra, setSelectedCompra] = useState<SoporteCompra | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { data: soportes, isLoading, error, refetch } = useSoporteByProveedor(user?.id ?? '')

  const handleResponderSoporte = (compra: SoporteCompra) => {
    setSelectedCompra(compra)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCompra(null)
    refetch() // Recargar datos después de cerrar el modal
  }

  if (error) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los casos de soporte. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        </Main>
      </>
    )
  }

  const statsData = soportes ? {
    total: soportes.length,
    activos: soportes.filter((s: SoporteCompra) => s.stock_productos?.soporte_stock_producto === 'activo').length,
    enSoporte: soportes.filter((s: SoporteCompra) => s.stock_productos?.soporte_stock_producto === 'soporte').length,
    resueltos: soportes.filter((s: SoporteCompra) => s.stock_productos?.soporte_stock_producto === 'resuelto').length,
  } : null

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button 
            className='rounded-full mx-2' 
            size="icon" 
            variant='ghost' 
            title='Recargar ventana' 
            onClick={() => window.location.reload()}
          >
            <IconRefresh />
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
                Soporte al Cliente
              </h1>
              <p className='text-muted-foreground'>
                Gestiona los casos de soporte de tus productos y ayuda a tus clientes
              </p>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          {statsData && (
            <div className='grid gap-4 md:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total Casos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{statsData.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Cuentas Sin Problemas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>{statsData.activos}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Problemas con Cuentas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-red-600'>{statsData.enSoporte}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Problemas Resueltos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>{statsData.resueltos}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Casos de Soporte</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ) : soportes && soportes.length > 0 ? (
                <SoporteTable 
                  columns={columns(handleResponderSoporte)} 
                  data={soportes} 
                />
              ) : (
                <div className='text-center py-12'>
                  <IconHeadphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className='text-muted-foreground mb-4'>No hay casos de soporte pendientes</p>
                  <p className='text-sm text-muted-foreground'>
                    Cuando tus clientes necesiten ayuda, aparecerán aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Modal de respuesta */}
      {selectedCompra && (
        <SoporteModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          compra={selectedCompra}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
