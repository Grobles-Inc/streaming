import { useAuth } from '@/stores/authStore'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { usePedidosTabla } from './hooks/use-pedidos-tabla'

export function PedidosPage() {
  const { user } = useAuth()
  const {
    rows,
    total,
    isLoading,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = usePedidosTabla(user?.id)

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
        <DataTable
          columns={columns}
          data={rows}
          total={total}
          loading={isLoading && rows.length === 0}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          sorting={sorting}
          onSortingChange={onSortingChange}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
        />
      </div>
    </Main>
  )
}
