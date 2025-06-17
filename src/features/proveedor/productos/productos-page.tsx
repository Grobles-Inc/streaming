import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { productosData } from './data/data'
import { columns } from './components/productos-columns'
import { ProductosTable } from './components/productos-table'

export function ProductosPage() {
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
              <h1 className='text-3xl font-bold tracking-tight'>Productos</h1>
              <p className='text-muted-foreground'>
                Gestiona tus productos y servicios de streaming
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductosTable columns={columns} data={productosData} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
} 