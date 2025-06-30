import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  IconClock, 
  IconCheck, 
  IconX,
  IconTrendingDown 
} from '@tabler/icons-react'
import type { EstadisticasRetiros } from '../data/types'

interface EstadisticasRetirosProps {
  estadisticas: EstadisticasRetiros | null
  loading?: boolean
}

export function EstadisticasRetirosCard({ estadisticas, loading = false }: EstadisticasRetirosProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
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
          <CardContent className="p-6 text-center text-muted-foreground">
            No hay datos disponibles
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto)
  }

  const porcentajeAprobados = estadisticas.total > 0 
    ? ((estadisticas.aprobadas / estadisticas.total) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total de retiros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Retiros</CardTitle>
          <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estadisticas.total}</div>
          <p className="text-xs text-muted-foreground">
            Monto total: {formatMonto(estadisticas.montoTotal)}
          </p>
        </CardContent>
      </Card>

      {/* Retiros pendientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <IconClock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {estadisticas.pendientes}
          </div>
          <p className="text-xs text-muted-foreground">
            Monto: {formatMonto(estadisticas.montoPendiente)}
          </p>
          {estadisticas.pendientes > 0 && (
            <Badge variant="secondary" className="mt-2">
              Requieren atención
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Retiros aprobados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          <IconCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {estadisticas.aprobadas}
          </div>
          <p className="text-xs text-muted-foreground">
            Monto: {formatMonto(estadisticas.montoAprobado)}
          </p>
          <p className="text-xs text-green-600 font-medium">
            {porcentajeAprobados}% del total
          </p>
        </CardContent>
      </Card>

      {/* Retiros rechazados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
          <IconX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {estadisticas.rechazadas}
          </div>
          <p className="text-xs text-muted-foreground">
            Monto: {formatMonto(estadisticas.montoRechazado)}
          </p>
          {estadisticas.rechazadas > 0 && (
            <p className="text-xs text-red-600">
              {((estadisticas.rechazadas / estadisticas.total) * 100).toFixed(1)}% rechazado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
