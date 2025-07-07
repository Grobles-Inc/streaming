import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useUpdateStockProductoAccountData } from '../queries'
import { Loader2 } from 'lucide-react'

interface EditAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockProductoId: number | null
  currentData: {
    email?: string | null
    clave?: string | null
    pin?: string | null
    perfil?: string | null
    url?: string | null
  }
  onClose: () => void
  onSuccess?: () => void
}

export function EditAccountModal({
  open,
  onOpenChange,
  stockProductoId,
  currentData,
  onClose,
  onSuccess
}: EditAccountModalProps) {
  const updateStockProducto = useUpdateStockProductoAccountData()
  const [formData, setFormData] = useState({
    email: currentData.email || '',
    clave: currentData.clave || '',
    pin: currentData.pin || '',
    perfil: currentData.perfil || '',
    url: currentData.url || ''
  })

  // Actualizar formulario cuando cambien los datos actuales o se abra el modal
  useEffect(() => {
    if (open) {
      setFormData({
        email: currentData.email || '',
        clave: currentData.clave || '',
        pin: currentData.pin || '',
        perfil: currentData.perfil || '',
        url: currentData.url || ''
      })
    }
  }, [open, currentData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stockProductoId) {
      toast.error('ID de stock producto no válido')
      return
    }

    updateStockProducto.mutate({
      stockProductoId,
      accountData: {
        email: formData.email || null,
        clave: formData.clave || null,
        pin: formData.pin || null,
        perfil: formData.perfil || null,
        url: formData.url || null
      }
    }, {
      onSuccess: () => {
        toast.success('Datos de cuenta actualizados correctamente')
        onSuccess?.()
        onClose()
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Datos de Cuenta</DialogTitle>
          <DialogDescription>
            Actualiza la información de acceso para este producto vendido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email de la Cuenta</Label>
              <Input
                id="email"
                type="text"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email de la cuenta"
              />
            </div>

            {/* Clave */}
            <div className="space-y-2">
              <Label htmlFor="clave">Contraseña</Label>
              <Input
                id="clave"
                type="text"
                value={formData.clave}
                onChange={(e) => handleInputChange('clave', e.target.value)}
                placeholder="Contraseña de la cuenta"
              />
            </div>
            {/* Perfil */}
            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil de la cuenta</Label>
              <Input
                id="perfil"
                value={formData.perfil}
                onChange={(e) => handleInputChange('perfil', e.target.value)}
                placeholder="Perfil de la cuenta"
              />
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="text"
                value={formData.pin}
                onChange={(e) => handleInputChange('pin', e.target.value)}
                placeholder="PIN de acceso"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">URL de Acceso</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://ejemplo.com"
              />
            </div>

            
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateStockProducto.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateStockProducto.isPending}
            >
              {updateStockProducto.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 