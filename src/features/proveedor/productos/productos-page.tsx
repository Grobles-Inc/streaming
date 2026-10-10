import { IconPlus } from '@tabler/icons-react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/stores/authStore'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { ProductoFormDialog } from './components/producto-form'
import { columns } from './components/productos-columns'
import { ProductosTable } from './components/productos-table'
import { Producto, productoCompleteSchema } from './data/schema'
import { useProductosByProveedor } from './queries'

export function ProductosPage() {
  const { user } = useAuth()
  const {
    data: productos,
    isLoading,
    error,
  } = useProductosByProveedor(user?.id ?? '')
  const productList = productos?.map((producto) =>
    productoCompleteSchema.parse(producto)
  )

  if (error) {
    return (
        <Main>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Error al cargar los productos. Por favor, intenta nuevamente.
            </AlertDescription>
          </Alert>
        </Main>
    )
  }

  return (
    <Main>
      <div className='space-y-6'>
        <div className='space-y-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Productos</h1>
            <p className='text-muted-foreground'>
              Gestiona tus productos desde este panel de administración de
              productos.
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
        <ProductosTable
          columns={columns}
          data={productList || ([] as Producto[])}
          isLoading={isLoading}
        />
      </div>
    </Main>
  )
}
