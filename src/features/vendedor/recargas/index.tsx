import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import RecargasProvider from './context/recargas-context'
import { recargaSchema } from './data/schema'
import { useRecargas } from './queries'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function Recargas() {
  const { data: recargas } = useRecargas()
  const recargasList = recargas?.data.map(recarga => recargaSchema.parse(recarga)) ?? []
  return (
    <RecargasProvider>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Recargas</h2>
          <p className='text-muted-foreground'>
            Aquí puedes ver la lista de tus recargas.
          </p>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={recargasList} columns={columns} />
        </div>
      </Main>
    </RecargasProvider>
  )
}
