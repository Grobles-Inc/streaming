import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  IconPackage, 
  IconUser, 
  IconTag, 
  IconCurrencyDollar,
  IconClock,
  IconInfoCircle,
  IconFileText,
  IconSettings,
  IconCalendar
} from '@tabler/icons-react'
import type { MappedProducto } from '../data/types'

interface ProductoDetailsModalProps {
  producto: MappedProducto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductoDetailsModal({ 
  producto, 
  open, 
  onOpenChange 
}: ProductoDetailsModalProps) {
  if (!producto) return null

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'publicado':
        return { variant: 'default' as const, label: 'Publicado', className: 'bg-green-50 text-green-700 border-green-200' }
      case 'borrador':
        return { variant: 'secondary' as const, label: 'Borrador', className: 'bg-gray-50 text-gray-700 border-gray-200' }
      default:
        return { variant: 'outline' as const, label: estado, className: '' }
    }
  }

  const getDisponibilidadBadge = (disponibilidad: string) => {
    switch (disponibilidad) {
      case 'en_stock':
        return { variant: 'default' as const, label: 'En Stock', className: 'bg-green-50 text-green-700 border-green-200' }
      case 'a_pedido':
        return { variant: 'secondary' as const, label: 'A Pedido', className: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'activacion':
        return { variant: 'outline' as const, label: 'Activación', className: 'bg-purple-50 text-purple-700 border-purple-200' }
      default:
        return { variant: 'outline' as const, label: disponibilidad, className: '' }
    }
  }

  const estadoBadge = getEstadoBadge(producto.estado)
  const disponibilidadBadge = getDisponibilidadBadge(producto.disponibilidad)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <IconPackage className="h-5 w-5" />
            Detalles del Producto
            <div className="flex gap-2">
              <Badge variant={estadoBadge.variant} className={estadoBadge.className}>
                {estadoBadge.label}
              </Badge>
              <Badge variant={disponibilidadBadge.variant} className={disponibilidadBadge.className}>
                {disponibilidadBadge.label}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconInfoCircle className="h-4 w-4" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={producto.imagenUrl || ''} alt={producto.nombre} />
                    <AvatarFallback>
                      <IconPackage className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{producto.nombre}</h4>
                    <p className="text-sm text-muted-foreground">{producto.categoriaNombre}</p>
                  </div>
                </div>
                
                {producto.descripcion && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descripción:</span>
                    <p className="text-sm mt-1">{producto.descripcion}</p>
                  </div>
                )}
                
                {producto.descripcionCompleta && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Descripción Completa:</span>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{producto.descripcionCompleta}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Precios */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconCurrencyDollar className="h-4 w-4" />
                Precios
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio Público:</span>
                  <span className="font-mono text-green-600 font-medium">{producto.precioPublicoFormateado}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio Vendedor:</span>
                  <span className="font-mono text-blue-600 font-medium">{producto.precioVendedorFormateado}</span>
                </div>
                {producto.precioRenovacionFormateado && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Precio Renovación:</span>
                    <span className="font-mono text-purple-600 font-medium">{producto.precioRenovacionFormateado}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Stock e Información */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconPackage className="h-4 w-4" />
                Stock e Información
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock Total:</span>
                  <span className="font-mono font-medium">{producto.stock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock Disponible:</span>
                  <span className="font-mono text-green-600 font-medium">{producto.stockDisponible}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock Vendido:</span>
                  <span className="font-mono text-red-600 font-medium">{producto.stockVendido}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Tiempo de Uso:</span>
                  <Badge variant="outline" className="text-xs">
                    <IconClock className="mr-1 h-3 w-3" />
                    {producto.tiempoUsoFormateado}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Proveedor */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconUser className="h-4 w-4" />
                Proveedor
              </h3>
              <div className="bg-muted p-3 rounded-md">
                <span className="font-medium">{producto.proveedorNombre}</span>
              </div>
            </div>

            <Separator />

            {/* Etiquetas y Características */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconTag className="h-4 w-4" />
                Características
              </h3>
              <div className="space-y-3">
                {producto.etiquetas.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Etiquetas:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {producto.etiquetas.map((etiqueta) => (
                        <Badge key={etiqueta} variant="secondary" className="text-xs">
                          {etiqueta}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Renovable:</span>
                    <Badge variant={producto.renovable ? 'default' : 'secondary'} className="text-xs">
                      {producto.renovable ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">A Pedido:</span>
                    <Badge variant={producto.aPedido ? 'default' : 'secondary'} className="text-xs">
                      {producto.aPedido ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Configuración */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconSettings className="h-4 w-4" />
                Configuración
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mostrar stock:</span>
                  <Badge variant={producto.muestraDisponibilidadStock ? 'default' : 'secondary'} className="text-xs">
                    {producto.muestraDisponibilidadStock ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Botón deshabilitado:</span>
                  <Badge variant={producto.deshabilitarBotonComprar ? 'destructive' : 'default'} className="text-xs">
                    {producto.deshabilitarBotonComprar ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información adicional */}
            {(producto.informacion || producto.condiciones || producto.solicitud) && (
              <>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                    <IconFileText className="h-4 w-4" />
                    Información Adicional
                  </h3>
                  <div className="space-y-3">
                    {producto.informacion && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Información:</span>
                        <div className="bg-muted p-3 rounded-md mt-1">
                          <p className="text-sm whitespace-pre-wrap">{producto.informacion}</p>
                        </div>
                      </div>
                    )}
                    
                    {producto.condiciones && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Condiciones:</span>
                        <div className="bg-muted p-3 rounded-md mt-1">
                          <p className="text-sm whitespace-pre-wrap">{producto.condiciones}</p>
                        </div>
                      </div>
                    )}
                    
                    {producto.solicitud && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Solicitud:</span>
                        <div className="bg-muted p-3 rounded-md mt-1">
                          <p className="text-sm whitespace-pre-wrap">{producto.solicitud}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Fechas e IDs */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Fechas e IDs
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Creado:</span>
                  <span className="text-sm">
                    {producto.fechaCreacion.toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Actualizado:</span>
                  <span className="text-sm">
                    {producto.fechaActualizacion.toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Producto:</span>
                  <span className="font-mono text-xs">{producto.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Categoría:</span>
                  <span className="font-mono text-xs">{producto.categoriaId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
