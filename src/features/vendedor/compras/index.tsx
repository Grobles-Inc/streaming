import { Main } from '@/components/layout/main'
import { useAuth } from '@/stores/authStore'
import { columns } from './components/columns'
import { ComprasDialogs } from './components/compras-dialogs'
import { DataTable } from './components/data-table'
import ComprasProvider from './context/compras-context'
import { compraSchema } from './data/schema'
import { useComprasByVendedor } from './queries'


export default function Compras() {
  const { user } = useAuth()
  const { data: compras } = useComprasByVendedor(user?.id as string)
  const comprasList = compras?.data.map(compra => compraSchema.parse(compra)) || []
  const totalCompras = compras?.count || 0

  return (
    <ComprasProvider>
           <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Compras</h2>
            <p className='text-muted-foreground'>
              Haz realizado {totalCompras} compra(s).
            </p>
          </div>
        </div>
                <DataTable
            data={comprasList || []}
            columns={columns}
          />
            </Main>
      <ComprasDialogs />
    </ComprasProvider>
  )
}
