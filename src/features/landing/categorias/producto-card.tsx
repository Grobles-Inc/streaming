import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ComprarProductoModal from './comprar-producto-modal'
import { useState } from 'react'
import { Producto } from '../services'



export default function ProductoCard({ producto }: { producto: Producto }) {
  const [open, setOpen] = useState(false)
  const tasaDeConversion = 3.7
  return (
    <>
      <Card className='relative pt-0 pb-4 md:pb-6 w-full max-w-sm  gap-2 md:gap-6'>
        <CardHeader className='p-0'>
          <img src={producto.imagen_url || ''} alt={producto.nombre} className="w-full md:h-52 h-36 object-cover rounded-t-lg" />
        </CardHeader>
        {/* A pedido badge */}
        {producto.a_pedido && (

          <Badge className="bg-green-600 absolute left-0 top-0 text-white    translate-y-[20%] shadow-md text-md translate-x-[10%]">
            A pedido
          </Badge>

        )}
        {producto.nuevo && (
          <Badge className='absolute left-2 md:bottom-[250px] bottom-44'>Nuevo</Badge>
        )}

        <CardContent className='flex flex-col px-4  '>

          <span className="text-xs text-gray-500 font-semibold  mb-1">{producto.usuarios.nombres.toUpperCase()}</span>
          <span className="font-bold md:text-lg mb-1 hidden md:block  leading-tight">{producto.nombre}</span>
          <span className="font-bold md:text-lg mb-1 md:hidden truncate  leading-tight">{producto.nombre}</span>
          <div className="md:flex flex-row hidden justify-between items-center w-full mb-2">
            <span className="text-xs text-green-600 ">Renovable: <span className="font-bold">${producto.precio.toFixed(2)}</span></span>
          </div>


          {/* Stock y precios */}
          <div className="flex flex-col md:flex-row justify-between items-center w-full ">
            <Badge className='hidden md:block'>Stock: {producto.stock} </Badge>

            <div className='flex flex-col'>
              <span className="font-bold text-xl text-foreground">     ${producto.precio.toFixed(2)}</span><span className="text-xs text-muted-foreground">S/.{(producto.precio * tasaDeConversion).toFixed(2)} </span>
            </div>
          </div>

        </CardContent>
        <CardFooter className='px-4'>
          <Button variant={producto.stock === 0 ? "destructive" : "default"} className="w-full" onClick={() => setOpen(true)} disabled={producto.stock === 0}>
            {producto.stock === 0 ? "Agotado" : "COMPRAR"}
          </Button>
        </CardFooter>
      </Card>
      <ComprarProductoModal open={open} onOpenChange={setOpen} producto={producto} />
    </>
  )
}
