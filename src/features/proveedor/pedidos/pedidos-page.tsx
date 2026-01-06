import { useAuth } from '@/stores/authStore'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { Pedido } from './data/schema'
import { usePedidosByProveedor } from './queries'

export function PedidosPage() {
  const { user } = useAuth()
  const { data: pedidos } = usePedidosByProveedor(user?.id as string)

  return (
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
        <DataTable data={(pedidos || []) as Pedido[]} columns={columns} />
      </div>
    </Main>
  )
}
