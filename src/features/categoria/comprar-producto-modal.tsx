import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSaldo } from '@/stores/balanceStore'
import { Producto } from '@/types'
import { toast } from 'sonner'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}

export default function ComprarProductoModal({ open, onOpenChange, producto }: ComprarProductoModalProps) {
  if (!producto) return null
  const { monto, actualizarSaldo } = useSaldo()
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  const isFormValid = formData.name.trim() !== '' && formData.phone.trim() !== ''

  function handleInputChange(field: 'name' | 'phone', value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function buyProduct() {
    if (!producto?.precioUSD) return
    if (monto < producto?.precioUSD) {
      toast.error("No tienes suficiente saldo", { duration: 3000 })
      return
    }
    toast.success("Producto comprado correctamente", { duration: 3000 })
    actualizarSaldo(monto - producto?.precioUSD)
    onOpenChange(false)
    setFormData({ name: '', phone: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle>{producto.categoria.toUpperCase()}</DialogTitle>
          <DialogDescription>{producto.titulo} {producto.subtitulo}</DialogDescription>

        </DialogHeader>
        <div className='flex justify-between'>
          <div className="flex flex-col w-full mb-2">
            <span className=" text-gray-500 font-semibold mb-1"> {producto.proveedor}</span>
            <Badge>Renovable: <span className="font-bold">${producto.precioRenovable.toFixed(2)}</span></Badge>
          </div>
          <div className='flex flex-col items-end'>
            <span className="font-bold text-2xl">${producto.precioUSD.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground"> S/.{producto.precioSoles.toFixed(2)}</span>
          </div>
        </div>

        {/* Accordion for Product Information */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="detalles">
            <AccordionTrigger>Detalles del producto</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.detalles}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="informacion">
            <AccordionTrigger>Información adicional</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.informacionDelProducto}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="condiciones">
            <AccordionTrigger>Condiciones de uso</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.condicionesDeUso}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Plan Selector (Read-only) */}
        <div className="mb-4">
          <div className="font-semibold mb-1">Ciclo de compra</div>
          <div className="flex gap-4">
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.periodo === '30' ? 'border-primary bg-secondary' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="30"
                checked={producto.periodo === '30'}
                disabled
                className="accent-primary mt-1"
              />
              <div>
                <span className="font-semibold text-base">30 días</span>
                <div className="text-xs text-muted-foreground">Acceso por 30 días.</div>
              </div>
            </label>
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.periodo === '1' ? 'border-primary bg-muted/30' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="1"
                checked={producto.periodo === '1'}
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
            disabled={!isFormValid}
          >
            {producto.textoBoton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
