import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'


export default function Dashboard() {
  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
            <p className='text-muted-foreground'>
              Aquí puedes ver el dashboard del vendedor.
            </p>
          </div>
        </div>
      </Main>
    </>
  )
}
