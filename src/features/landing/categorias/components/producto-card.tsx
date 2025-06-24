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
  const tasaDeConversion = 3.7
  return (
    <>
      <Card className='relative overflow-hidden pb-4 pt-0 md:pb-6 w-full max-w-sm gap-4 md:gap-6'>
        <CardHeader className="relative z-0 px-0 ">
          <img src={producto.imagen_url || ''} alt={producto.nombre} className='w-full' />
          {!producto.nuevo && (
            <Badge className='ml-4 mt-2'>Nuevo</Badge>
          )}
          <div className="absolute  flex-col right-2 top-2 flex gap-1">
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
        {producto.stock && (
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



        <CardContent className='flex flex-col px-4  '>

          <span className="text-xs text-gray-500 font-semibold  mb-1">{producto.usuarios.nombres.toUpperCase()}</span>
          <span className="font-bold md:text-lg mb-1 hidden md:block  leading-tight">{producto.nombre}</span>
          <span className="font-bold md:text-lg text-sm mb-1 md:hidden truncate  leading-tight">{producto.nombre}</span>
          <div className="md:flex flex-row hidden justify-between items-center w-full mb-2">
            <span className="text-xs text-green-600 ">Renovable: <span className="font-bold">${producto.precio_publico.toFixed(2)}</span></span>
          </div>


          {/* Stock y precios */}
          <div className="flex flex-col md:flex-row justify-between md:items-center w-full ">
            <Badge className='hidden md:block'>Stock: {producto.stock} </Badge>

            <div className='flex md:flex-col flex-row-reverse justify-between md:justify-start items-center'>
              <span className="font-bold md:text-xl text-foreground">     ${producto.precio_publico.toFixed(2)}</span><span className="text-xs text-muted-foreground">S/.{(producto.precio_publico * tasaDeConversion).toFixed(2)} </span>
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
      <ProductoInfoModal
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
        producto={producto}
        type={infoModalType}
      />
    </>
  )
}
