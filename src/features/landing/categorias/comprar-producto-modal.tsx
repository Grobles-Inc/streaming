import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useBilleteraByUsuario, useUpdateBilleteraSaldo } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'
import { toast } from 'sonner'
import { Producto } from '../services'

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}

export default function ComprarProductoModal({ open, onOpenChange, producto }: ComprarProductoModalProps) {
  if (!producto) return null
  const { user } = useAuthStore()

  const { data: billetera } = useBilleteraByUsuario(user?.id || '0')
  const { mutate: actualizarSaldo } = useUpdateBilleteraSaldo()
  const monto = billetera?.saldo
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  function handleInputChange(field: 'name' | 'phone', value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function buyProduct() {
    if (!user?.id) {
      toast.error("Debes iniciar sesión para comprar un producto", { duration: 3000 })
      return
    }
    if (!producto?.precio || !monto || !billetera?.id) return
    if (monto && monto < producto?.precio) {
      toast.error("No tienes suficiente saldo", { duration: 3000 })
      return
    }
    toast.success("Producto comprado correctamente", { duration: 3000 })
    actualizarSaldo({ id: billetera?.id, nuevoSaldo: monto - producto?.precio })
    onOpenChange(false)
    setFormData({ name: '', phone: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle>{producto.categorias.nombre.toUpperCase()}</DialogTitle>
          <DialogDescription>{producto.descripcion}</DialogDescription>

        </DialogHeader>
        <div className='flex justify-between'>
          <span className=" text-gray-500 font-semibold mb-1">Proveedor: {producto.usuarios.nombres}</span>
          <span className="font-bold text-2xl">${producto.precio.toFixed(2)}</span>
        </div>

        {/* Accordion for Product Information */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="detalles">
            <AccordionTrigger>Detalles del producto</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="informacion">
            <AccordionTrigger>Información adicional</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.informacion}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="condiciones">
            <AccordionTrigger>Condiciones de uso</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.condiciones}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Plan Selector (Read-only) */}
        <div className="mb-4">
          <div className="font-semibold mb-1">Tiempo de compra</div>
          <div className="flex gap-4">
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.tiempo_uso === 30 ? 'border-primary bg-secondary' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="30"
                checked={producto.tiempo_uso === 30}
                disabled
                className="accent-primary mt-1"
              />
              <div>
                <span className="font-semibold text-base">30 días</span>
                <div className="text-xs text-muted-foreground">Acceso por 30 días.</div>
              </div>
            </label>
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.tiempo_uso === 1 ? 'border-primary bg-muted/30' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="1"
                checked={producto.tiempo_uso === 1}
                disabled
                className="accent-primary mt-1"
              />
              <div>
                <span className="font-semibold text-base">1 día</span>
                <div className="text-xs text-muted-foreground">Acceso por 1 día.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <h3 className="font-semibold">Información de compra</h3>
          <div className="space-y-3">
            <div>
              <Input
                id="name"
                type="text"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Input
                id="phone"
                type="tel"
                placeholder="Número de teléfono"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full"
            onClick={buyProduct}
          >
            Comprar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
