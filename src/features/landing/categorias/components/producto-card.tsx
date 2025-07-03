import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ComprarProductoModal from './comprar-producto-modal'
import ProductoInfoModal from './producto-info-modal'
import { useState } from 'react'
import { Producto } from '../../services'
import { IconFileInfo, IconHandClick, IconHeartHandshake } from '@tabler/icons-react'



export default function ProductoCard({ producto }: { producto: Producto }) {
  const [open, setOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoModalType, setInfoModalType] = useState<'informacion' | 'descripcion' | 'condiciones'>('informacion')
  const isAgotado = producto?.stock_de_productos?.length === 0
  const tasaDeConversion = 3.7
  return (
    <>
      <Card className='relative overflow-hidden max-w-sm gap-4 flex flex-col h-full'>
        <CardHeader className="relative z-0  ">
          <img src={producto.imagen_url || ''} alt={producto.nombre} className='w-full h-44 object-contain ' />
          <div className='flex items-center gap-1  mt-2'>

            {producto.nuevo && (
              <Badge className='bg-green-500' >Nuevo</Badge>
            )}
            {/* //TODO: These badges should be synced with the db */}
            {producto.nuevo && (
              <Badge className='bg-red-500' >- 15%</Badge>
            )}
            {producto.nuevo && (
              <Badge className='bg-gray-500 text-white' >Oferta</Badge>
            )}
          </div>
          <div className="absolute  flex-col right-2 -top-4 flex gap-1">
            <Button size="icon" variant="secondary" title="Información del Producto" onClick={() => {
              setInfoModalType('informacion')
              setInfoModalOpen(true)
            }}>
              <IconHeartHandshake />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              title="Descripción del Producto"
              onClick={() => {
                setInfoModalType('descripcion')
                setInfoModalOpen(true)
              }}
            >
              <IconFileInfo />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              title="Condiciones del Producto"
              onClick={() => {
                setInfoModalType('condiciones')
                setInfoModalOpen(true)
              }}
            >
              <IconHandClick />
            </Button>
          </div>
        </CardHeader>
        {producto.stock_de_productos?.length > 0 && (
          <div className="absolute top-0 left-0 z-50">
            <div
              className="bg-blue-600  text-white px-10 py-2 text-sm font-bold shadow-xl dark:shadow-white/30 shadow-black/30 whitespace-nowrap"
              style={{
                transform: 'rotate(-45deg)',
                transformOrigin: 'center',
                position: 'relative',
                left: '-35px',
                top: '18px'
              }}
            >
              En Stock
            </div>
          </div>
        )}

        {producto.a_pedido && (
          <div className="absolute top-0 left-0 z-50">
            <div
              className="bg-green-600  text-white px-10 py-2 text-sm font-bold shadow-xl dark:shadow-white/30 shadow-black/30 whitespace-nowrap"
              style={{
                transform: 'rotate(-45deg)',
                transformOrigin: 'center',
                position: 'relative',
                left: '-35px',
                top: '18px'
              }}
            >
              A pedido
            </div>
          </div>
        )}
        <CardContent className='flex flex-col px-4 flex-grow'>
          <span className="text-xs text-gray-500 font-semibold  mb-1">{producto.usuarios.nombres.toUpperCase()}</span>
          <span className="font-bold md:text-lg mb-1 hidden md:block  leading-tight">{producto.nombre}</span>
          <span className="font-bold md:text-lg text-sm mb-1 md:hidden truncate  leading-tight">{producto.nombre}</span>
          <div className="md:flex flex-row hidden justify-between items-center w-full mb-2">
            <span className="text-xs text-green-600 ">Renovable: <span className="font-bold">${producto.precio_publico.toFixed(2)}</span></span>
          </div>


          {/* Stock y precios */}
          <div className="flex flex-col md:flex-row justify-between md:items-center w-full ">
            <Badge className='hidden md:block'>Stock: {producto.stock_de_productos.length} </Badge>

            <div className='flex md:flex-col flex-row-reverse justify-between md:justify-start items-center'>
              <span className="font-bold md:text-xl text-foreground">     ${producto.precio_publico.toFixed(2)}</span><span className="text-xs text-muted-foreground">S/.{(producto.precio_publico * tasaDeConversion).toFixed(2)} </span>
            </div>
          </div>

        </CardContent>
        <CardFooter className='px-4'>
          <Button variant={isAgotado ? "destructive" : "default"} className="w-full" onClick={() => setOpen(true)} disabled={isAgotado}>
            {isAgotado ? "Agotado" : "COMPRAR"}
          </Button>
        </CardFooter>
      </Card>
      <ComprarProductoModal open={open} onOpenChange={setOpen} producto={producto} />
      <ProductoInfoModal
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
        producto={producto}
        type={infoModalType}
      />
    </>
  )
}
