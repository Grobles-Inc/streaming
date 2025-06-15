import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ComprarProductoModal from './comprar-producto-modal'
import { useState } from 'react'
import { Producto } from '@/types'



export default function ProductoCard({ producto }: { producto: Producto }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Card className='relative pt-0 w-full max-w-sm '>
        <CardHeader className='p-0'>
          <img src={producto.imagen} alt={producto.titulo} className="w-full h-52 object-cover rounded-t-lg" />
        </CardHeader>
        {/* A pedido badge */}
        {producto.aPedido && (

          <Badge className="bg-green-600 absolute left-0 top-0 text-white    translate-y-[20%] shadow-md text-md translate-x-[10%]">
            A pedido
          </Badge>

        )}
        {producto.nuevo && (
          <Badge className='absolute left-2 bottom-[270px]'>Nuevo</Badge>
        )}

        <CardContent className='flex flex-col px-4'>

          <span className="text-xs text-gray-500 font-semibold  mb-1">Proveedor: {producto.proveedor}</span>
          <span className="font-bold md:text-lg mb-1 leading-tight">{producto.titulo}</span>
          <div className="md:flex flex-row hidden justify-between items-center w-full mb-2">
            <span className="text-xs text-green-600 ">Renovable: <span className="font-bold">${producto.precioRenovable.toFixed(2)}</span></span>
          </div>
          <div className="flex flex-row justify-between items-center w-full mb-2">
            <span className="text-xs text-muted-foreground">Soles: S/.{producto.precioSoles.toFixed(2)}</span>
          </div>
          {/* Stock y precios */}
          <div className="flex flex-row justify-between items-center w-full mb-2">
            <span className="text-xs hidden md:block text-foreground">Stock: <span className="font-bold">{producto.stock}</span></span>

            <span className="font-bold text-xl text-foreground">${producto.precioUSD.toFixed(2)}</span>
          </div>

        </CardContent>
        <CardFooter className='px-4'>
          <Button variant={producto.stock === 0 ? "destructive" : "default"} className="w-full" onClick={() => setOpen(true)} disabled={producto.stock === 0}>
            {producto.stock === 0 ? "Agotado" : "VER PRODUCTO"}
          </Button>
        </CardFooter>
      </Card>
      <ComprarProductoModal open={open} onOpenChange={setOpen} producto={producto} />
    </>
  )
}
