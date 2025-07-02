import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconCreditCard, IconUsers } from '@tabler/icons-react'
import { useRecargas, useMetricasGlobales } from './queries'
import { MetricasCard } from './components'

// Hooks para obtener datos de otras features
import { useBilleteras, useRecargas as useRecargasBilleteras, useRetiros } from '../billeteras/queries'
import { useCompras } from '../compras/hooks/use-compras'
import { useRecargas as useRecargasRecargas } from '../recargas/hooks/use-recargas'
import { useRetiros as useRetirosRetiros } from '../retiros/hooks/use-retiros'

// Componentes de estadísticas
import { ComprasStats } from '../compras/components/compras-stats'
import { EstadisticasRecargasCard } from '../recargas/components/estadisticas-recargas'
import { EstadisticasRetirosCard } from '../retiros/components/estadisticas-retiros'

export default function ReportesGlobalesPage() {
  const { loading: recargasLoading } = useRecargas()
  const { metricas, loading: metricasLoading } = useMetricasGlobales()

  // Hooks para estadísticas de otras features
  const { billeteras } = useBilleteras()
  const { recargas: recargasBilleteras } = useRecargasBilleteras()
  const { retiros } = useRetiros()
  const { estadisticas: estadisticasCompras, loading: loadingCompras } = useCompras()
  const { estadisticas: estadisticasRecargas } = useRecargasRecargas()
  const { estadisticas: estadisticasRetiros } = useRetirosRetiros()

  // Calcular estadísticas de billeteras
  const totalSaldo = billeteras.reduce((sum, billetera) => sum + billetera.saldo, 0)
  const recargasPendientes = recargasBilleteras.filter(r => r.estado === 'pendiente').length
  const retirosPendientes = retiros.filter(r => r.estado === 'pendiente').length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
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
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Reportes Globales</h2>
            <p className='text-muted-foreground'>
              Visualiza métricas generales y administra usuarios, productos y recargas desde una vista consolidada.
            </p>
          </div>
        </div>

        {/* Métricas principales */}
        <MetricasCard metricas={metricas} loading={metricasLoading} />

        <Tabs defaultValue="compras" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="recargas">Recargas</TabsTrigger>
            <TabsTrigger value="billeteras">Billeteras</TabsTrigger>
            <TabsTrigger value="retiros">Retiros</TabsTrigger>
          </TabsList>

          {/* Estadísticas de Billeteras */}
          <TabsContent value="billeteras">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total en Billeteras</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(totalSaldo)}
                        </p>
                      </div>
                      <IconCreditCard className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Usuarios</p>
                        <p className="text-2xl font-bold">
                          {billeteras.length}
                        </p>
                      </div>
                      <IconUsers className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Recargas Pendientes</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {recargasPendientes}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Pendientes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Retiros Pendientes</p>
                        <p className="text-2xl font-bold text-red-600">
                          {retirosPendientes}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Pendientes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Estadísticas de Compras */}
          <TabsContent value="compras">
            <div className="space-y-6">
              <ComprasStats 
                estadisticas={estadisticasCompras} 
                loading={loadingCompras} 
              />
            </div>
          </TabsContent>

          {/* Estadísticas de Recargas */}
          <TabsContent value="recargas">
            <div className="space-y-6">
              <EstadisticasRecargasCard 
                estadisticas={estadisticasRecargas} 
                loading={recargasLoading} 
              />
            </div>
          </TabsContent>

          {/* Estadísticas de Retiros */}
          <TabsContent value="retiros">
            <div className="space-y-6">
              <EstadisticasRetirosCard 
                estadisticas={estadisticasRetiros} 
                loading={loadingCompras} 
              />
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}