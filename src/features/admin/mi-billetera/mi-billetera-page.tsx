import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MiBilleteraContent } from './components/mi-billetera-content'

export default function MiBilleteraPage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mi Billetera</h2>
            <p className='text-muted-foreground'>
              Gestiona tu billetera personal como administrador. Consulta retiros y comisiones.
            </p>
          </div>
        </div>
        <MiBilleteraContent />
      </Main>
    </>
  )
}
