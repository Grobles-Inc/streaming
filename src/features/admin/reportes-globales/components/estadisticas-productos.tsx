import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, Zap, Archive, ShoppingCart } from 'lucide-react'
import { useProductos } from '../../productos/hooks/use-productos'

export function EstadisticasProductosCard() {
  const { estadisticas, loading } = useProductos()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estadísticas de Productos
          </CardTitle>
          <CardDescription>Cargando estadísticas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const statsCards = [
    {
      title: 'Total productos',
      value: estadisticas?.total || 0,
      description: 'Productos en el sistema',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Publicados',
      value: estadisticas?.publicados || 0,
      description: 'Productos activos',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Borradores',
      value: estadisticas?.borradores || 0,
      description: 'En desarrollo',
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'En stock',
      value: estadisticas?.enStock || 0,
      description: 'Con inventario disponible',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'A pedido',
      value: estadisticas?.aPedido || 0,
      description: 'Bajo solicitud',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },

    {
      title: 'Nuevos',
      value: estadisticas?.nuevos || 0,
      description: 'Productos recientes',
      icon: Package,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Estadísticas de Productos
        </CardTitle>
        <CardDescription>
          Resumen general del catálogo de productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <div key={stat.title} className={`${stat.bgColor} p-4 rounded-lg border`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{stat.title}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen por categorías */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Resumen por estado</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
              Publicados: {estadisticas?.publicados || 0}
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
              Borradores: {estadisticas?.borradores || 0}
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              En Stock: {estadisticas?.enStock || 0}
            </Badge>
            <Badge variant="outline" className="border-orange-200 text-orange-700">
              A Pedido: {estadisticas?.aPedido || 0}
            </Badge>
          </div>
        </div>

        {/* Resumen por características */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Características especiales</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-purple-200 text-purple-700">
      
            </Badge>

            <Badge variant="outline" className="border-teal-200 text-teal-700">
              ✨ Nuevos: {estadisticas?.nuevos || 0}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
