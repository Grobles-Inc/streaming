import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { columns } from './components/cuentas-columns'
import { CuentasTable } from './components/cuentas-table'
import { useCuentasByProveedor } from './queries'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { CuentaForm } from './components/cuenta-form'
import { Button } from '@/components/ui/button'
import { IconRefresh } from '@tabler/icons-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { useAuth } from '@/stores/authStore'

export function CuentasPage() {
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const { data: cuentas, isLoading, error } = useCuentasByProveedor(user?.id || '')

  if (isLoading) {
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
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-4 w-96 mt-2' />
              </div>
            </div>

            <Card>
              <CardHeader>
                <Skeleton className='h-6 w-32' />
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Main>
      </>
    )
  }

  if (error) {
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
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>Cuentas</h1>
                <p className='text-muted-foreground'>
                  Gestiona las cuentas y credenciales de tus productos de streaming
                </p>
              </div>
            </div>

            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Error al cargar las cuentas. Por favor, inténtalo de nuevo.
              </AlertDescription>
            </Alert>
          </div>
        </Main>
      </>
    )
  }

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
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Cuentas</h1>
              <p className='text-muted-foreground'>
                Gestiona las cuentas y credenciales de tus productos de streaming
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Cuentas ({cuentas?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <CuentasTable 
                columns={columns} 
                data={cuentas || []} 
                onAddCuenta={() => setShowForm(true)}
              />
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <CuentaForm 
            onClose={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        )}
      </Main>
    </>
  )
}
