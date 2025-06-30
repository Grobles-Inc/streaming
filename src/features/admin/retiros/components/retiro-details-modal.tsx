import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  IconUser, 
  IconCash, 
  IconCalendar, 
  IconClock,
  IconCheck,
  IconX,
  IconEdit,
  IconPhone
} from '@tabler/icons-react'
import { toast } from 'sonner'
import type { MappedRetiro, EstadoRetiro } from '../data/types'

interface RetiroDetailsModalProps {
  retiro: MappedRetiro | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateEstado: (id: string, nuevoEstado: EstadoRetiro) => Promise<boolean>
}

export function RetiroDetailsModal({ 
  retiro, 
  open, 
  onOpenChange, 
  onUpdateEstado 
}: RetiroDetailsModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState<EstadoRetiro>('pendiente')
  const [actualizando, setActualizando] = useState(false)

  if (!retiro) return null

  const handleUpdateEstado = async () => {
    if (nuevoEstado === retiro.estado) {
      toast.warning('El estado seleccionado es el mismo que el actual')
      return
    }

    setActualizando(true)
    try {
      const success = await onUpdateEstado(retiro.id, nuevoEstado)
      if (success) {
        toast.success(`Estado actualizado a "${nuevoEstado}" exitosamente`)
        onOpenChange(false)
      } else {
        toast.error('Error al actualizar el estado')
      }
    } catch (error) {
      toast.error('Error al actualizar el estado')
    } finally {
      setActualizando(false)
    }
  }

  // Función para obtener el badge del estado
  function getEstadoBadge(estado: string) {
    switch (estado) {
      case 'aprobado':
        return { 
          variant: 'default' as const, 
          label: 'Aprobado',
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: IconCheck
        }
      case 'pendiente':
        return { 
          variant: 'secondary' as const, 
          label: 'Pendiente',
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          icon: IconClock
        }
      case 'rechazado':
        return { 
          variant: 'destructive' as const, 
          label: 'Rechazado',
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: IconX
        }
      default:
        return { 
          variant: 'outline' as const, 
          label: estado,
          className: '',
          icon: IconClock
        }
    }
  }

  const estadoBadge = getEstadoBadge(retiro.estado)
  const EstadoIcon = estadoBadge.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Detalles de Retiro
          </DialogTitle>
          <DialogDescription>
            Información completa de la solicitud de retiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado actual */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <EstadoIcon className="h-5 w-5" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={estadoBadge.variant} className={estadoBadge.className}>
                {estadoBadge.label}
              </Badge>
            </CardContent>
          </Card>

          {/* Información del usuario */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Información del Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Nombre completo:</span>
                <span>{retiro.usuarioNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nombres:</span>
                <span>{retiro.usuarioNombres}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Apellidos:</span>
                <span>{retiro.usuarioApellidos}</span>
              </div>
              {retiro.usuarioTelefono && (
                <div className="flex justify-between">
                  <span className="font-medium flex items-center gap-1">
                    <IconPhone className="h-4 w-4" />
                    Teléfono:
                  </span>
                  <span>{retiro.usuarioTelefono}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del retiro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconCash className="h-5 w-5" />
                Detalles del Retiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Monto:</span>
                <span className="text-lg font-bold text-red-600">
                  {retiro.montoFormateado}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconCalendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Fecha de Solicitud:</span>
                <div className="text-right">
                  <div className="text-sm">
                    {retiro.fechaCreacion.toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {retiro.fechaCreacion.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Última Actualización:</span>
                <div className="text-right">
                  <div className="text-sm">
                    {retiro.fechaActualizacion.toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {retiro.fechaActualizacion.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar estado */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconEdit className="h-5 w-5" />
                Cambiar Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Select 
                  value={nuevoEstado} 
                  onValueChange={(value: EstadoRetiro) => setNuevoEstado(value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar nuevo estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleUpdateEstado}
                  disabled={actualizando || nuevoEstado === retiro.estado}
                  className="min-w-[120px]"
                >
                  {actualizando ? 'Actualizando...' : 'Actualizar'}
                </Button>
              </div>
              {nuevoEstado === retiro.estado && (
                <p className="text-sm text-muted-foreground">
                  El estado seleccionado es el mismo que el actual
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
