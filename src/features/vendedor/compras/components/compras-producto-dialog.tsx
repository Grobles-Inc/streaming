import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { useProductoById } from '../queries'

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
        isLoading ? <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
          </DialogHeader>
          <div className='flex justify-center items-center h-full'>
            <Loader2 className='w-4 h-4 animate-spin' />
          </div>
        </DialogContent> :
          <DialogContent className="max-w-md w-full">
            <DialogHeader className='flex flex-col gap-3'>
              <DialogTitle>{producto?.nombre.toUpperCase()}</DialogTitle>
              <DialogDescription>{producto?.nombre}</DialogDescription>
            </DialogHeader>
            <div className='flex justify-between'>
              <span className=" text-gray-500 font-semibold mb-1">Proveedor: {producto?.usuarios?.nombres}</span>
              <span className="font-bold text-2xl">${producto?.precio_publico.toFixed(2)}</span>
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
                  className="flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors border-primary bg-secondary flex items-start gap-3"
                >
                  <input
                    type="radio"
                    name="plan"
                    value={producto?.tiempo_uso}
                    checked={!!producto?.tiempo_uso}
                    disabled
                    className="accent-primary mt-1"
                  />
                  <div>
                    <span className="font-semibold text-base">{producto?.tiempo_uso} días</span>
                    <div className="text-xs text-muted-foreground">Acceso por {producto?.tiempo_uso} días.</div>
                  </div>
                </label>

              </div>
            </div>
          </DialogContent>
      }
    </Dialog>
  )
}
