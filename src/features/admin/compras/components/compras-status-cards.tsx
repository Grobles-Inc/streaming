import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { 
  IconCheck, 
  IconX, 
  IconClock, 
  IconCurrencyDollar,
  IconPackage,
  IconEdit
} from '@tabler/icons-react'
import { toast } from 'sonner'
import type { MappedCompra, EstadoCompra } from '../data/types'

interface ComprasStatusCardsProps {
  compras: MappedCompra[]
  onCambiarEstado: (id: number, nuevoEstado: EstadoCompra) => Promise<{ success: boolean }>
  loading?: boolean
}

// Función para obtener información del estado
function getEstadoInfo(estado: EstadoCompra) {
  switch (estado) {
    case 'resuelto':
      return {
        label: 'Resuelto',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: IconCheck,
        description: 'Compras completadas exitosamente'
      }
    case 'vencido':
      return {
        label: 'Vencido',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: IconX,
        description: 'Compras que han expirado'
      }
    case 'soporte':
      return {
        label: 'Soporte',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: IconClock,
        description: 'Compras que requieren atención'
      }
    case 'reembolsado':
      return {
        label: 'Reembolsado',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: IconCurrencyDollar,
        description: 'Compras reembolsadas al cliente'
      }
    case 'pedido_entregado':
      return {
        label: 'Pedido Entregado',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        icon: IconPackage,
        description: 'Pedidos entregados al cliente'
      }
  }
}

// Estados disponibles para cambio
const estadosDisponibles: { value: EstadoCompra; label: string }[] = [
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'reembolsado', label: 'Reembolsado' },
  { value: 'pedido_entregado', label: 'Pedido Entregado' },
]

interface CompraCardProps {
  compra: MappedCompra
  onCambiarEstado: (id: number, nuevoEstado: EstadoCompra) => Promise<{ success: boolean }>
}

function CompraCard({ compra, onCambiarEstado }: CompraCardProps) {
  const estadoInfo = getEstadoInfo(compra.estado)
  const Icon = estadoInfo.icon

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (nuevoEstado === compra.estado) return

    try {
      const result = await onCambiarEstado(compra.id, nuevoEstado as EstadoCompra)
      if (result.success) {
        toast.success('Estado actualizado', {
          description: `La compra ha sido marcada como ${estadosDisponibles.find(e => e.value === nuevoEstado)?.label.toLowerCase()}`
        })
      }
    } catch (error) {
      toast.error('Error al actualizar estado', {
        description: 'No se pudo actualizar el estado de la compra'
      })
    }
  }

  return (
    <Card className={`${estadoInfo.bgColor} ${estadoInfo.borderColor} border-2 hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${estadoInfo.bgColor}`}>
              <Icon className={`h-4 w-4 ${estadoInfo.color}`} />
            </div>
            <Badge variant="outline" className={`${estadoInfo.color} ${estadoInfo.borderColor}`}>
              {estadoInfo.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <IconEdit className="h-4 w-4 text-muted-foreground" />
            <Select
              value={compra.estado}
              onValueChange={handleCambiarEstado}
            >
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estadosDisponibles.map((estado) => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold text-sm">{compra.nombreCliente}</p>
          <p className="text-xs text-muted-foreground">{compra.telefonoCliente}</p>
        </div>
        
        <div>
          <p className="font-medium text-sm">{compra.productoNombre}</p>
          <p className="text-xs text-muted-foreground">por {compra.proveedorNombre}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">{compra.precioFormateado}</span>
          <span className="text-xs text-muted-foreground">
            {compra.fechaCreacion.toLocaleDateString('es-PE')}
          </span>
        </div>
        
        {compra.montoReembolso > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-purple-600">
              Reembolso: {compra.montoReembolsoFormateado}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ComprasStatusCards({ compras, onCambiarEstado, loading }: ComprasStatusCardsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {estadosDisponibles.map((estado) => (
          <div key={estado.value}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-24 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Agrupar compras por estado
  const comprasPorEstado = estadosDisponibles.reduce((acc, estado) => {
    acc[estado.value] = compras.filter(compra => compra.estado === estado.value)
    return acc
  }, {} as Record<EstadoCompra, MappedCompra[]>)

  return (
    <div className="space-y-8">
      {estadosDisponibles.map((estado) => {
        const comprasDelEstado = comprasPorEstado[estado.value]
        const estadoInfo = getEstadoInfo(estado.value)
        const Icon = estadoInfo.icon

        return (
          <div key={estado.value}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${estadoInfo.bgColor}`}>
                <Icon className={`h-5 w-5 ${estadoInfo.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{estadoInfo.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {estadoInfo.description} ({comprasDelEstado.length} compra{comprasDelEstado.length !== 1 ? 's' : ''})
                </p>
              </div>
            </div>
            
            {comprasDelEstado.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {comprasDelEstado.map((compra) => (
                  <CompraCard
                    key={compra.id}
                    compra={compra}
                    onCambiarEstado={onCambiarEstado}
                  />
                ))}
              </div>
            ) : (
              <Card className={`${estadoInfo.bgColor} ${estadoInfo.borderColor} border-2 border-dashed`}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Icon className={`h-8 w-8 ${estadoInfo.color} mb-2`} />
                  <p className="text-sm text-muted-foreground">
                    No hay compras con estado "{estadoInfo.label.toLowerCase()}"
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )
      })}
    </div>
  )
}
