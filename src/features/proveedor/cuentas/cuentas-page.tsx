import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { cuentasData } from './data/data'
import { columns } from './components/cuentas-columns'
import { CuentasTable } from './components/cuentas-table'

export function CuentasPage() {
  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
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
              <CardTitle>Lista de Cuentas</CardTitle>
            </CardHeader>
            <CardContent>
              <CuentasTable columns={columns} data={cuentasData} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}
