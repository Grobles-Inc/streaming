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
import { useUpdateStockProductoAccountData, useUpdateProductoPrecioRenovacion, useUpdatePedidoFechas, useUpdateProductoTiempoUso } from '../queries'
import { formatearFechaParaInput, calcularDuracionEnDias } from '../utils/fecha-utils'
import { Loader2 } from 'lucide-react'

interface EditAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockProductoId: number | null
  productoId: number | null
  pedidoId: number | null
  currentData: {
    email?: string | null
    clave?: string | null
    pin?: string | null
    perfil?: string | null
    url?: string | null
    precio_renovacion?: number | null
    fecha_inicio?: string | null
    fecha_expiracion?: string | null
    tiempo_uso?: number | null
  }
  onClose: () => void
  onSuccess?: () => void
}

export function EditAccountModal({
  open,
  onOpenChange,
  stockProductoId,
  productoId,
  pedidoId,
  currentData,
  onClose,
  onSuccess
}: EditAccountModalProps) {
  const updateStockProducto = useUpdateStockProductoAccountData()
  const updatePrecioRenovacion = useUpdateProductoPrecioRenovacion()
  const updatePedidoFechas = useUpdatePedidoFechas()
  const updateTiempoUso = useUpdateProductoTiempoUso()
  
  const [formData, setFormData] = useState({
    email: currentData.email || '',
    clave: currentData.clave || '',
    pin: currentData.pin || '',
    perfil: currentData.perfil || '',
    url: currentData.url || '',
    precio_renovacion: currentData.precio_renovacion?.toString() || '',
    fecha_inicio: formatearFechaParaInput(currentData.fecha_inicio ?? null),
    fecha_expiracion: formatearFechaParaInput(currentData.fecha_expiracion ?? null),
  })

  // Calcular días de uso actual usando la nueva utilidad
  const diasUsoCalculado = calcularDuracionEnDias(formData.fecha_inicio, formData.fecha_expiracion)

  // Actualizar formulario cuando cambien los datos actuales o se abra el modal
  useEffect(() => {
    if (open) {
      setFormData({
        email: currentData.email || '',
        clave: currentData.clave || '',
        pin: currentData.pin || '',
        perfil: currentData.perfil || '',
        url: currentData.url || '',
        precio_renovacion: currentData.precio_renovacion?.toString() || '',
        fecha_inicio: formatearFechaParaInput(currentData.fecha_inicio ?? null),
        fecha_expiracion: formatearFechaParaInput(currentData.fecha_expiracion ?? null),
      })
    }
  }, [open, currentData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stockProductoId) {
      toast.error('ID de stock producto no válido')
      return
    }

    try {
      // Actualizar datos de cuenta
      await updateStockProducto.mutateAsync({
        stockProductoId,
        accountData: {
          email: formData.email || null,
          clave: formData.clave || null,
          pin: formData.pin || null,
          perfil: formData.perfil || null,
          url: formData.url || null
        }
      })

      // Actualizar precio de renovación en productos si está disponible
      if (productoId && formData.precio_renovacion && formData.precio_renovacion.trim() !== '') {
        await updatePrecioRenovacion.mutateAsync({
          productoId,
          precioRenovacion: parseFloat(formData.precio_renovacion)
        })
      }

      // Actualizar fechas del pedido si está disponible
      if (pedidoId && (formData.fecha_inicio || formData.fecha_expiracion)) {
        await updatePedidoFechas.mutateAsync({
          pedidoId,
          fechaInicio: formData.fecha_inicio || null,
          fechaExpiracion: formData.fecha_expiracion || null
        })
      }

      // Actualizar tiempo de uso del producto basado en las fechas
      if (productoId && diasUsoCalculado > 0) {
        await updateTiempoUso.mutateAsync({
          productoId,
          tiempoUso: diasUsoCalculado
        })
      }

      toast.success('Datos actualizados correctamente')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Error al actualizar los datos')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // const calcularFechaExpiracion = (fechaInicio: string, dias: number): string => {
  //   if (!fechaInicio || dias <= 0) return ''
    
  //   const inicio = new Date(fechaInicio)
  //   const expiracion = new Date(inicio.getTime() + (dias * 24 * 60 * 60 * 1000))
  //   return expiracion.toISOString().split('T')[0]
  // }

  const isLoading = updateStockProducto.isPending || updatePrecioRenovacion.isPending || 
                   updatePedidoFechas.isPending || updateTiempoUso.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Datos de Cuenta y Fechas</DialogTitle>
          <DialogDescription>
            Actualiza la información de acceso, fechas y duración para este producto vendido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Sección de Fechas y Duración */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-medium text-gray-900">Fechas y Duración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Inicio */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => handleInputChange('fecha_inicio', e.target.value)}
                  />
                </div>

                {/* Fecha Expiración */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_expiracion">Fecha de Expiración</Label>
                  <Input
                    id="fecha_expiracion"
                    type="date"
                    value={formData.fecha_expiracion}
                    onChange={(e) => handleInputChange('fecha_expiracion', e.target.value)}
                  />
                </div>

                {/* Duración Calculada (Solo lectura) */}
                <div className="space-y-2">
                  <Label htmlFor="tiempo_uso_calculado">Duración (días) - Calculado</Label>
                  <Input
                    id="tiempo_uso_calculado"
                    type="number"
                    value={diasUsoCalculado}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    title={`Calculado automáticamente: ${diasUsoCalculado} días entre ${formData.fecha_inicio || 'fecha inicio'} y ${formData.fecha_expiracion || 'fecha expiración'}`}
                  />
                  <p className="text-xs text-gray-500">
                    Se calcula automáticamente basado en las fechas de inicio y expiración
                  </p>
                </div>

                {/* Precio de Renovación */}
                <div className="space-y-2">
                  <Label htmlFor="precio_renovacion">Precio de Renovación</Label>
                  <Input 
                    id="precio_renovacion"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_renovacion}
                    onChange={(e) => handleInputChange('precio_renovacion', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Datos de Cuenta */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="text-sm font-medium text-gray-900">Datos de la Cuenta</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 