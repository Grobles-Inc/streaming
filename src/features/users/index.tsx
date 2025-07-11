import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider, { useUsersContext } from './context/users-context'

function UsersContent() {
  const { 
    users, 
    loading, 
    error,
    setOpen
  } = useUsersContext()

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar usuarios</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      </Main>
    )
  }

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios</h2>
            <p className='text-muted-foreground'>
              Gestiona los usuarios y sus roles.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen('disabledUsers')}
              size="sm"
            >
              Ver usuarios deshabilitados
            </Button>
            <UsersPrimaryButtons />
          </div>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <UsersTable data={users} columns={columns} />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </>
  )
}

export default function Users() {
  return (
    <UsersProvider>
      <UsersContent />
    </UsersProvider>
  )
}
