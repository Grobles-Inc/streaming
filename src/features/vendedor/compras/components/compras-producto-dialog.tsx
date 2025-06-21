import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useProductoById } from '../queries'
import { Loader2 } from 'lucide-react'

type ComprasProductoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
}

export default function ComprasProductoDialog({ open, onOpenChange, id }: ComprasProductoDialogProps) {

  const { data: producto, isLoading } = useProductoById(id)


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {
        isLoading ? <DialogContent><Loader2 className='w-4 h-4 animate-spin' /></DialogContent> : <DialogContent className="max-w-md w-full">
          <DialogHeader className='flex flex-col gap-3'>
            <DialogTitle>{producto?.nombre.toUpperCase()}</DialogTitle>
            <DialogDescription>{producto?.nombre}</DialogDescription>

          </DialogHeader>
          <div className='flex justify-between'>
            <span className=" text-gray-500 font-semibold mb-1">Proveedor: {producto?.usuarios?.nombres}</span>
            <span className="font-bold text-2xl">${producto?.precio.toFixed(2)}</span>
          </div>

          {/* Accordion for Product Information */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="detalles">
              <AccordionTrigger>Detalles del producto</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{producto?.descripcion}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="informacion">
              <AccordionTrigger>Información adicional</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{producto?.informacion}</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="condiciones">
              <AccordionTrigger>Condiciones de uso</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{producto?.condiciones}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Plan Selector (Read-only) */}
          <div className="mb-4">
            <div className="font-semibold mb-1">Tiempo de compra</div>
            <div className="flex gap-4">
              <label
                className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto?.tiempo_uso === 30 ? 'border-primary bg-secondary' : 'border-muted bg-transparent'} flex items-start gap-3`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="30"
                  checked={producto?.tiempo_uso === 30}
                  disabled
                  className="accent-primary mt-1"
                />
                <div>
                  <span className="font-semibold text-base">30 días</span>
                  <div className="text-xs text-muted-foreground">Acceso por 30 días.</div>
                </div>
              </label>
              <label
                className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto?.tiempo_uso === 1 ? 'border-primary bg-muted/30' : 'border-muted bg-transparent'} flex items-start gap-3`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="1"
                  checked={producto?.tiempo_uso === 1}
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



          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      }
    </Dialog>
  )
}
