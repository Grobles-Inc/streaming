import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  IconUser, 
  IconShoppingCart, 
  IconClock, 
  IconPhone,
  IconMail,
  IconKey,
  IconId,
  IconCurrencyDollar,
  IconHeadset,
  IconMessage,
  IconFileText
} from '@tabler/icons-react'
import type { MappedCompra } from '../data/types'

interface CompraDetailsModalProps {
  compra: MappedCompra | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompraDetailsModal({ 
  compra, 
  open, 
  onOpenChange 
}: CompraDetailsModalProps) {
  if (!compra) return null

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'entregado':
        return { variant: 'default' as const, label: 'Entregado', className: 'bg-green-50 text-green-700 border-green-200' }
      case 'cancelado':
        return { variant: 'destructive' as const, label: 'Cancelado', className: 'bg-red-50 text-red-700 border-red-200' }
      case 'en_proceso':
        return { variant: 'secondary' as const, label: 'En Proceso', className: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'reembolsado':
        return { variant: 'outline' as const, label: 'Reembolsado', className: 'bg-purple-50 text-purple-700 border-purple-200' }
      case 'pendiente':
        return { variant: 'secondary' as const, label: 'Pendiente', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
      default:
        return { variant: 'outline' as const, label: estado, className: '' }
    }
  }

  const badge = getEstadoBadge(compra.estado)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            
            Detalles de Compra
            <Badge variant={badge.variant} className={badge.className}>
              {badge.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Cliente */}
          

          {/* Información del Producto */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <IconShoppingCart className="h-4 w-4" />
              Producto
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <span className="font-medium">{compra.productoNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio:</span>
                <span className="font-mono text-green-600 font-medium">{compra.precioFormateado}</span>
              </div>
            </div>
          </div>

          <Separator />

          

          {/* Información de Usuarios */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <IconUser className="h-4 w-4" />
              Usuarios Involucrados
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Proveedor:</span>
                <span className="font-medium">{compra.proveedorNombre}</span>
              </div>
              {compra.vendedorNombre && compra.vendedorNombre !== 'Sin vendedor asignado' && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Vendedor:</span>
                  <span className="font-medium">{compra.vendedorNombre}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de Reembolso */}
          {compra.montoReembolso > 0 && (
            <>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <IconCurrencyDollar className="h-4 w-4" />
                  Reembolso
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto:</span>
                    <span className="font-mono text-purple-600 font-medium">{compra.montoReembolsoFormateado}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant={compra.requiereReembolso ? 'destructive' : 'default'}>
                      {compra.requiereReembolso ? 'Pendiente' : 'Procesado'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Información de Soporte */}
          {(compra.soporteAsunto || compra.soporteMensaje || compra.soporteRespuesta) && (
            <>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <IconHeadset className="h-4 w-4" />
                  Soporte
                </h3>
                <div className="space-y-3">
                  {compra.soporteAsunto && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <IconFileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">Asunto:</span>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{compra.soporteAsunto}</p>
                      </div>
                    </div>
                  )}
                  {compra.soporteMensaje && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <IconMessage className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">Mensaje:</span>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm">{compra.soporteMensaje}</p>
                      </div>
                    </div>
                  )}
                  {compra.soporteRespuesta && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <IconMessage className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-muted-foreground font-medium">Respuesta:</span>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Respondido
                        </Badge>
                      </div>
                      <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                        <p className="text-sm text-green-800">{compra.soporteRespuesta}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Información de Fechas */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              Fechas
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Creada:</span>
                <span className="text-sm">
                  {compra.fechaCreacion.toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Actualizada:</span>
                <span className="text-sm">
                  {compra.fechaActualizacion.toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {compra.fechaExpiracion && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Expiración:</span>
                  <div className="text-right">
                    <span className={`text-sm ${compra.fechaExpiracion < new Date() ? 'text-red-600 font-medium' : ''}`}>
                      {compra.fechaExpiracion.toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {compra.fechaExpiracion < new Date() && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Vencida
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tiempo restante:</span>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    compra.tiempoTranscurrido.includes('Vencido') || compra.tiempoTranscurrido.includes('Vence hoy')
                      ? 'text-red-600'
                      : compra.tiempoTranscurrido.match(/(\d+)\s+día/) && 
                        parseInt(compra.tiempoTranscurrido.match(/(\d+)\s+día/)![1]) <= 5
                        ? 'text-red-600'
                        : compra.tiempoTranscurrido.match(/(\d+)\s+día/) && 
                          parseInt(compra.tiempoTranscurrido.match(/(\d+)\s+día/)![1]) <= 15
                          ? 'text-yellow-600'
                          : 'text-green-600'
                  }`}>
                    {compra.tiempoTranscurrido}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* IDs de Sistema */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <IconId className="h-4 w-4" />
              IDs del Sistema
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID Compra:</span>
                <span className="font-mono text-xs">{compra.id}</span>
              </div>
              {compra.stockProductoId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Stock:</span>
                  <span className="font-mono text-xs">{compra.stockProductoId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
