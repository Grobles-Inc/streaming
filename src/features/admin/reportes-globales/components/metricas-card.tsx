import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconUsers, IconPackage, IconWallet, IconTrendingUp } from '@tabler/icons-react'
import type { MetricasGlobales } from '../data/types'

interface MetricasCardProps {
  metricas: MetricasGlobales | null
  loading: boolean
}

export function MetricasCard({ metricas, loading }: MetricasCardProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metricas) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total Recargado</CardTitle>
          <IconWallet className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(metricas.montoTotalRecargado || 0).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <IconPackage className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.totalProductos}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
          <IconUsers className="text-muted-foreground" />
        </CardHeader>      
        <CardContent>
          <div className="text-2xl font-bold">{metricas.totalUsuarios}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Recargas</CardTitle>
          <IconTrendingUp className="text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.totalRecargas}</div>
        </CardContent>
      </Card>
    </div>
  )
}
