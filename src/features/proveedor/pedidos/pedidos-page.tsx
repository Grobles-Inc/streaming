import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuth } from '@/stores/authStore'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { usePedidosByProveedor } from './queries'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Pedido } from './data/schema'



export function PedidosPage() {
  const { user } = useAuth()
  const { data: pedidos } = usePedidosByProveedor(user?.id as string)

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pedidos</h2>
            <p className='text-muted-foreground'>
              Gestiona todos los pedidos y ventas de tus productos.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable
            data={(pedidos || []) as Pedido[]}
            columns={columns}
          />
        </div>
      </Main>
    </>
  )
}
