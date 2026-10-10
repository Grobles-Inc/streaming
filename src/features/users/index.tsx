
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider, { useUsersContext } from './context/users-context'
import { useUsersTabla } from './hooks/use-users-tabla'

function UsersContent() {
  const {
    error,
    refreshUsers
  } = useUsersContext()

  const {
    rows,
    total,
    isLoading,
    error: tableError,
    refetch,
    pagination,
    sorting,
    columnFilters,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
  } = useUsersTabla()

  const loadError = tableError?.message ?? error

  if (loadError) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar usuarios</h3>
            <p className="text-sm text-gray-600 mt-2">{loadError}</p>
            <Button
              onClick={() => {
                refetch()
                refreshUsers()
              }}
              className="mt-4"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Usuarios</h2>
            <p className='text-muted-foreground'>
              Gestiona los usuarios y sus roles.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* <Button
              variant="outline"
              onClick={() => setOpen('disabledUsers')}
              size="sm"
            >
              Ver usuarios deshabilitados
            </Button> */}
            <UsersPrimaryButtons />
          </div>
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable
            data={rows}
            columns={columns}
            total={total}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            sorting={sorting}
            onSortingChange={onSortingChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
          />
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
