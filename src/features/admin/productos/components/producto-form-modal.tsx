import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductoForm } from './producto-form'
import type { SupabaseProducto } from '../data/types'

interface ProductoFormModalProps {
  isOpen: boolean
  onClose: () => void
  producto?: SupabaseProducto
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {producto ? 'Editar producto' : 'Agregar nuevo producto'}
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
