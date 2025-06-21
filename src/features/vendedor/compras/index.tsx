import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { useAuth } from '@/stores/authStore'
import { columns } from './components/columns'
import { ComprasDialogs } from './components/compras-dialogs'
import { ComprasPrimaryButtons } from './components/compras-primary-buttons'
import { DataTable } from './components/data-table'
import ComprasProvider from './context/compras-context'
import { compraSchema } from './data/schema'
import { useComprasByVendedor } from './queries'

export default function Compras() {
  const { user } = useAuth()
  const { data: compras } = useComprasByVendedor(user?.id as string)
  const comprasList = compras?.map(compra => compraSchema.parse(compra))
  return (
    <ComprasProvider>
      <Header fixed>
        <Search />

      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Compras</h2>
            <p className='text-muted-foreground'>
              Aquí puedes ver la lista de tus compras.
            </p>
          </div>
          <ComprasPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable
            data={comprasList || []}
            columns={columns}
          />
        </div>
      </Main>
      <ComprasDialogs />
    </ComprasProvider>
  )
}
