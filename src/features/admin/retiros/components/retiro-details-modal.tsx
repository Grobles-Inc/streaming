import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  IconAlertTriangle,
  IconCash,
  IconPhone
} from '@tabler/icons-react'
import type { MappedRetiro } from '../data/types'

interface RetiroDetailsModalProps {
  retiro: MappedRetiro | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RetiroDetailsModal({
  retiro,
  open,
  onOpenChange,
}: RetiroDetailsModalProps) {

  if (!retiro) return null





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

        <div className="space-y-3">



          <div className="flex justify-between">
            <span className="font-medium">Monto:</span>
            <span className="text-lg font-bold">
              {retiro.montoFormateado}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">ID de billetera:</span>
            <span className="text-sm font-mono text-muted-foreground">
              {retiro.billeteraId || 'N/A'}
            </span>
          </div>
          {!retiro.puedeAprobar && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <IconAlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Saldo insuficiente</p>
                <p className="text-red-700">
                  El usuario no tiene saldo suficiente para procesar este retiro.
                  Saldo disponible: <strong>{retiro.saldoFormateado}</strong>, Monto solicitado: <strong>{retiro.montoFormateado}</strong>
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-medium">Nombre completo:</span>
            <span>{retiro.usuarioNombre}</span>
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



        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
