import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  IconCoin, 
  IconPackage, 
  IconWallet, 
  IconTrendingUp,
  IconCalculator,
  IconPercentage
} from '@tabler/icons-react'
import type { EstadisticasComisiones } from '../data/types'

interface ComisionesStatsProps {
  estadisticas: EstadisticasComisiones
  loading?: boolean
}

export function ComisionesStats({ estadisticas, loading }: ComisionesStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Comisiones',
      value: `$${estadisticas.totalComisiones.toFixed(2)}`,
      description: `${estadisticas.cantidadPublicaciones + estadisticas.cantidadRetiros} transacciones`,
      icon: IconCoin,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Comisiones Publicación',
      value: `$${estadisticas.totalComisionesPublicacion.toFixed(2)}`,
      description: `${estadisticas.cantidadPublicaciones} publicaciones`,
      icon: IconPackage,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Comisiones Retiro',
      value: `$${estadisticas.totalComisionesRetiro.toFixed(2)}`,
      description: `${estadisticas.cantidadRetiros} retiros`,
      icon: IconWallet,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Promedio General',
      value: `$${((estadisticas.promedioComisionPublicacion + estadisticas.promedioComisionRetiro) / 2).toFixed(2)}`,
      description: 'Por transacción',
      icon: IconTrendingUp,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
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
      
      {/* Tarjetas adicionales con detalles */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconCalculator className="h-4 w-4" />
            Promedios por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <IconPackage className="h-3 w-3 mr-1" />
                Publicación
              </Badge>
            </div>
            <span className="font-medium">${estadisticas.promedioComisionPublicacion.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <IconWallet className="h-3 w-3 mr-1" />
                Retiro
              </Badge>
            </div>
            <span className="font-medium">${estadisticas.promedioComisionRetiro.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Distribución porcentual */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IconPercentage className="h-4 w-4" />
            Distribución de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Publicaciones</span>
              <span className="font-medium">
                {estadisticas.totalComisiones > 0 
                  ? ((estadisticas.totalComisionesPublicacion / estadisticas.totalComisiones) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: estadisticas.totalComisiones > 0 
                    ? `${(estadisticas.totalComisionesPublicacion / estadisticas.totalComisiones) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Retiros</span>
              <span className="font-medium">
                {estadisticas.totalComisiones > 0 
                  ? ((estadisticas.totalComisionesRetiro / estadisticas.totalComisiones) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ 
                  width: estadisticas.totalComisiones > 0 
                    ? `${(estadisticas.totalComisionesRetiro / estadisticas.totalComisiones) * 100}%` 
                    : '0%' 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
