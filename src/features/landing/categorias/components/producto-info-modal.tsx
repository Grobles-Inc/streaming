import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Producto } from '../../services'

interface ProductoInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto
  type: 'informacion' | 'descripcion' | 'condiciones'
}

export default function ProductoInfoModal({
  open,
  onOpenChange,
  producto,
  type
}: ProductoInfoModalProps) {
  const title = type === 'informacion' ? 'Información del Producto' : type === 'descripcion' ? 'Descripción del Producto' : 'Condiciones del Producto'
  const content = type === 'informacion' ? producto.informacion : type === 'descripcion' ? producto.descripcion : producto.condiciones

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-primary">{title}</h3>


          <div className="space-y-3">
            {content ? (
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic text-center py-8">
                No hay {type} disponible para este producto
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
} 