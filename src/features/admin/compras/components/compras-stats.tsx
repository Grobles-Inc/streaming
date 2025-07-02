import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  IconShoppingCart, 
  IconCheck, 
  IconX, 
  IconClock, 
  IconCurrencyDollar,
  IconPackage
} from '@tabler/icons-react'
import type { EstadisticasCompras } from '../data/types'

interface ComprasStatsProps {
  estadisticas: EstadisticasCompras | null
  loading?: boolean
}

export function ComprasStats({ estadisticas, loading }: ComprasStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-muted rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!estadisticas) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Sin datos disponibles
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Compras',
      value: estadisticas.total.toLocaleString(),
      description: 'Todas las compras',
      icon: IconShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Resueltas',
      value: estadisticas.resueltas.toLocaleString(),
      description: `${((estadisticas.resueltas / estadisticas.total) * 100).toFixed(1)}% del total`,
      icon: IconCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Vencidas',
      value: estadisticas.vencidas.toLocaleString(),
      description: `${((estadisticas.vencidas / estadisticas.total) * 100).toFixed(1)}% del total`,
      icon: IconX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'En Soporte',
      value: estadisticas.soporte.toLocaleString(),
      description: `${((estadisticas.soporte / estadisticas.total) * 100).toFixed(1)}% del total`,
      icon: IconClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Reembolsadas',
      value: estadisticas.reembolsadas.toLocaleString(),
      description: `${((estadisticas.reembolsadas / estadisticas.total) * 100).toFixed(1)}% del total`,
      icon: IconCurrencyDollar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pedido Entregado',
      value: estadisticas.pedidoEntregado.toLocaleString(),
      description: `${((estadisticas.pedidoEntregado / estadisticas.total) * 100).toFixed(1)}% del total`,
      icon: IconPackage,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  const ingresoStats = [
    {
      title: 'Ingreso Total',
      value: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD',
      }).format(estadisticas.ingresoTotal),
      description: 'Todos los ingresos',
      icon: IconCurrencyDollar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ingreso Resuelto',
      value: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD',
      }).format(estadisticas.ingresoResuelto),
      description: 'Solo compras resueltas',
      icon: IconCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monto Reembolsado',
      value: new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD',
      }).format(estadisticas.montoReembolsado),
      description: 'Total reembolsado',
      icon: IconCurrencyDollar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas de Estado */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estado de Compras</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Estadísticas Monetarias */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Estadísticas Monetarias</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {ingresoStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
