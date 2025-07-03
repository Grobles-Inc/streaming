import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductoForm } from './producto-form'
import type { SupabaseProducto } from '../data/types'

interface ProductoFormModalProps {
  isOpen: boolean
  onClose: () => void
  producto?: SupabaseProducto // Opcional para evitar errores
  onSuccess?: () => void
}

export function ProductoFormModal({ 
  isOpen, 
  onClose, 
  producto, 
  onSuccess 
}: ProductoFormModalProps) {
  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  // No renderizar si no hay producto seleccionado
  if (!producto) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="dialog-wide max-h-[90vh] overflow-y-auto"
        data-testid="producto-modal"
        style={{ width: '90vw', maxWidth: '72rem' }}
      >
        <DialogHeader>
          <DialogTitle>
            Editar producto: {producto.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ProductoForm
          producto={producto}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
