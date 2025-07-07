import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuth } from '@/stores/authStore'
import { columns } from './components/columns'
import { ComprasDialogs } from './components/compras-dialogs'
import { DataTable } from './components/data-table'
import ComprasProvider from './context/compras-context'
import { compraSchema } from './data/schema'
import { useComprasByVendedor } from './queries'
import { IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export default function Compras() {
  const { user } = useAuth()
  const { data: compras, refetch, isRefetching } = useComprasByVendedor(user?.id as string)
  const comprasList = compras?.data.map(compra => compraSchema.parse(compra)) || []
  const totalCompras = compras?.count || 0
  return (
    <ComprasProvider>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button className=' rounded-full mx-2' size="icon" variant='ghost' title='Recargar ventana' onClick={() => refetch()} disabled={isRefetching} >
            <IconRefresh className={`${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>


      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Compras</h2>
            <p className='text-muted-foreground'>
              Haz realizado {totalCompras} compra(s).
            </p>
          </div>
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
