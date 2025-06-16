import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { IconWallet } from '@tabler/icons-react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { ResumenBarChart } from './components/resumen-bar-chart'
import { ResumenPieChart } from './components/resumen-pie-chart'

export default function Dashboard() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground'>
              Revisa tus estadísticas, recargas, compras y más.
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button>Descargar</Button>
          </div>
        </div>


        <div className='grid gap-4 my-4 sm:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Saldo Neto
              </CardTitle>
              <IconWallet className='text-muted-foreground ' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>$ 500.00</div>
              <p className='text-muted-foreground text-xs'>
                +20.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Recargas
              </CardTitle>
              <ArrowUp className='text-muted-foreground ' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>+ $45,231.89</div>

            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Compras
              </CardTitle>
              <ArrowDown className='text-muted-foreground ' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>- $2350</div>

            </CardContent>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-4'>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className='pl-2'>
              <ResumenBarChart />
            </CardContent>
          </Card>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle>Gráfico de Recargas</CardTitle>
              <CardDescription>
                Comparativa de recargas y compras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumenPieChart />
            </CardContent>
          </Card>
        </div>

      </Main>
    </>
  )
}

