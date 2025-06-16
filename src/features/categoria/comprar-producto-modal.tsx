import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Producto } from '@/types'
import { toast } from 'sonner'

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}


export default function ComprarProductoModal({ open, onOpenChange, producto }: ComprarProductoModalProps) {
  if (!producto) return null

  function buyProduct() {
    toast.success("Producto comprado correctamente", { duration: 3000 })
    onOpenChange(false)
  }
  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle>{producto.categoria.toUpperCase()}</DialogTitle>
          <DialogDescription>{producto.titulo} {producto.subtitulo}</DialogDescription>
          <img src={producto.imagen} alt={producto.titulo} className="w-full h-48 object-cover rounded-lg" />
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
        <div className='flex flex-col gap-4'>
          <div>
            <h3 className="font-semibold mb-2">Detalles</h3>
            <p className="text-sm text-muted-foreground">{producto.detalles}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Información</h3>
            <p className="text-sm text-muted-foreground">{producto.informacionDelProducto}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Condiciones de uso</h3>
            <p className="text-sm text-muted-foreground">{producto.condicionesDeUso}</p>
          </div>
        </div>
        <DialogFooter>
          <Button className="w-full" onClick={buyProduct}>{producto.textoBoton}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )
}
