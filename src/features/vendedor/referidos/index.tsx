import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { useAuth } from '@/stores/authStore'
import { useReferidos } from './queries'
import { referidoSchema } from './data/schema'

export default function Referidos() {
  const { user } = useAuth()
  const { data: referidos } = useReferidos(user?.id || '')
  const referidosList = referidos?.map(referido => referidoSchema.parse(referido)) ?? []
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
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Referidos</h2>
          <p className='text-muted-foreground'>
            Usuarios que se han registrado a través de tu código de referido.
          </p>
        </div>

        <div className='-mx-4 flex-1 over
        flow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <DataTable data={referidosList} columns={columns} />
        </div>
      </Main>
    </>
  )
}
