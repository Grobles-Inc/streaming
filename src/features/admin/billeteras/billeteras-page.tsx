import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { BilleterasDialogs } from './components/billeteras-dialogs'
import { DataTable } from './components/data-table'
import BilleterasProvider from './context/billeteras-context'
import { billeteraSchema } from './data/schema'
import { useBilleteras } from './queries'

export default function BilleterasPage() {
  const { billeteras, loading, error } = useBilleteras()
  const billeterasList = billeteras?.map((billetera: any) => billeteraSchema.parse(billetera)) || []
  const totalBilleteras = billeteras?.length || 0

  if (loading) {
    return (
      <Main>
        <div className='flex flex-col items-center gap-6 py-10'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary' />
          <p className='text-muted-foreground'>Cargando billeteras...</p>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className='text-center text-red-600'>Error: {error}</div>
      </Main>
    )
  }

  return (
    <BilleterasProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Billeteras</h2>
            <p className='text-muted-foreground'>
              {totalBilleteras} billetera(s) en total.
            </p>
          </div>
        </div>
        <DataTable
          data={billeterasList || []}
          columns={columns}
        />
      </Main>
      <BilleterasDialogs />
    </BilleterasProvider>
  )
}