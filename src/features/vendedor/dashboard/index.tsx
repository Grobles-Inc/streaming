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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBilleteraByUsuario } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { IconWallet } from '@tabler/icons-react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { useComprasByVendedor } from '../compras/queries'
import { useRecargasByVendedor } from '../recargas/queries'
import { ResumenComprasPieChart } from './components/compras-pie-chart'
import { ComprasRecientes } from './components/compras-recientes'
import { ResumenRecargasPieChart } from './components/recargas-pie-chart'
import { ResumenBarChart } from './components/resumen-bar-chart'

type TimeFilter = 'day' | 'week' | 'month'

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const { auth } = useAuthStore()
  if (!auth.user?.id) {
    return null
  }
  const { data: billetera } = useBilleteraByUsuario(auth.user.id)
  const { data: recargas } = useRecargasByVendedor(auth.user.id)
  const { data: compras } = useComprasByVendedor(auth.user.id)
  const saldo = billetera?.saldo || 0
  const totalRecargas = recargas?.reduce((acc, recarga) => acc + recarga.monto, 0) || 0
  const totalCompras = compras?.reduce((acc, compra) => acc + compra.precio, 0) || 0
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
              <div className='text-2xl font-bold'>$ {saldo}</div>
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
              <div className='text-2xl font-bold'>+ $ {totalRecargas}</div>

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
              <div className='text-2xl font-bold'>- $ {totalCompras}</div>

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
              <CardTitle>Compras Recientes</CardTitle>
              <CardDescription>
                Compras realizadas en los últimos 30 días.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComprasRecientes />
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                Gráfico de Compras
                <Select
                  onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                  defaultValue='month'
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un filtro' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='day'>Diario</SelectItem>
                    <SelectItem value='week'>Semanal</SelectItem>
                    <SelectItem value='month'>Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>
                Comparativa de compras.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumenComprasPieChart timeFilter={timeFilter} />
            </CardContent>
          </Card>
          <Card className='col-span-1 lg:col-span-3'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                Gráfico de Recargas
                <Select
                  onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                  defaultValue='month'
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un filtro' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='day'>Diario</SelectItem>
                    <SelectItem value='week'>Semanal</SelectItem>
                    <SelectItem value='month'>Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>
                Comparativa de recargas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumenRecargasPieChart timeFilter={timeFilter} />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

