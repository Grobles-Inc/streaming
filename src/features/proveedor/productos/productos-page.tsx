import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { columns } from './components/productos-columns'
import { ProductosTable } from './components/productos-table'
import { useProductosByProveedor } from './queries'
import { useAuth } from '@/stores/authStore'
import { Producto, productoCompleteSchema } from './data/schema'
import { Button } from '@/components/ui/button'
import { IconRefresh, IconPlus } from '@tabler/icons-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ProductoFormDialog } from './components/producto-form'

export function ProductosPage() {
  const { user } = useAuth()
  const { data: productos, isLoading, error } = useProductosByProveedor(user?.id ?? '')
  const productList = productos?.map(producto => productoCompleteSchema.parse(producto))


  if (error) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
  
          </div>
        </Header>
        <Main>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar los productos. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button className=' rounded-full mx-2' size="icon" variant='ghost' title='Recargar ventana' onClick={() => window.location.reload()} >
            <IconRefresh />
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='space-y-4'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Productos</h1>
              <p className='text-muted-foreground'>
                Gestiona tus productos desde este panel de administración de productos.
              </p>
            </div>
            <div className='flex gap-2'>
              <ProductoFormDialog
                trigger={
                  <Button>
                    <IconPlus className='mr-2 h-4 w-4' />
                    Nuevo Producto
                  </Button>
                }
              />
            </div>
          </div>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : productos && productos.length > 0 ? (
            <ProductosTable columns={columns} data={productList || [] as Producto[]} />
          ) : (
            <div className='text-center py-12'>
              <p className='text-muted-foreground mb-4'>No tienes productos registrados</p>
              <p className='text-sm text-muted-foreground'>
                Comienza agregando tu primer producto para comenzar a vender
              </p>
            </div>
          )}
        </div>
      </Main>
    </>
  )
} 