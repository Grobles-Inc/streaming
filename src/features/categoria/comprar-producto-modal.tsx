import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Producto } from '@/types'
import { useState } from 'react'
import { toast } from 'sonner'

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}

type InfoType = 'detalles' | 'info' | 'condiciones' | null

export default function ComprarProductoModal({ open, onOpenChange, producto }: ComprarProductoModalProps) {
  const [openInfo, setOpenInfo] = useState<InfoType>(null)
  if (!producto) return null

  // Dynamic content for the info modal
  let infoTitle = ''
  let infoContent = ''
  if (openInfo === 'detalles') {
    infoTitle = "Detalles"
    infoContent = producto.detalles
  } else if (openInfo === 'info') {
    infoTitle = "Información"
    infoContent = producto.informacionDelProducto
  } else if (openInfo === 'condiciones') {
    infoTitle = "Condiciones de uso"
    infoContent = producto.condicionesDeUso
  }

  function buyProduct() {
    toast.success("Producto comprado correctamente", { duration: 3000 })
    onOpenChange(false)
  }
  return (
    <>
      {/* Modal principal */}
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
          <div className='flex gap-2'>
            <Button variant="link" className="px-0 text-muted-foreground h-auto text-xs underline" onClick={() => setOpenInfo('detalles')}>Detalles</Button> |
            <Button variant="link" className="px-0 h-auto text-muted-foreground  text-xs underline" onClick={() => setOpenInfo('info')}>Información</Button> |
            <Button variant="link" className="px-0 text-muted-foreground  h-auto text-xs underline" onClick={() => setOpenInfo('condiciones')}>Condiciones de uso</Button>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={buyProduct}>{producto.textoBoton}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!openInfo} onOpenChange={v => !v && setOpenInfo(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{infoTitle}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-foreground whitespace-pre-line">{infoContent}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
