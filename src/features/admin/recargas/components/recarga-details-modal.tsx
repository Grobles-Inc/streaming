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
  IconCash,
  IconPhone
} from '@tabler/icons-react'
import type { MappedRecarga } from '../data/types'

interface RecargaDetailsModalProps {
  recarga: MappedRecarga | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecargaDetailsModal({
  recarga,
  open,
  onOpenChange,
}: RecargaDetailsModalProps) {

  if (!recarga) return null





  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCash className="h-5 w-5" />
            Detalles de Recarga
          </DialogTitle>
          <DialogDescription>
            Información completa de la solicitud de recarga
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">


          <div className="flex justify-between">
            <span className="">Monto:</span>
            <span className=" font-bold">
              {recarga.montoFormateado}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="">Usuario:</span>
            <span>{recarga.usuarioNombre}</span>
          </div>

          {recarga.usuarioTelefono && (
            <div className="flex justify-between">
              <span className=" flex items-center gap-1">
                <IconPhone className="h-4 w-4" />
                Teléfono:
              </span>
              <span>{recarga.usuarioTelefono}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="">Fecha de Solicitud:</span>
            <div className="text-right">
              <div className="text-sm">
                {recarga.fechaCreacion.toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {recarga.fechaCreacion.toLocaleTimeString('es-PE', {
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
