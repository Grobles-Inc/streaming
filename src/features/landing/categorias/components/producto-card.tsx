import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { useAuth } from '@/stores/authStore'
import { IconFileInfo, IconHandClick, IconHeartHandshake } from '@tabler/icons-react'
import { useState } from 'react'
import { useConfiguracionSistema } from '../../queries'
import { Producto } from '../../services'
import '../../styles/card.css'
import ComprarProductoModal from './comprar-producto-modal'
import ProductoInfoModal from './producto-info-modal'


export default function ProductoCard({ producto }: { producto: Producto }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { getProxiedImageUrl } = useImageProxy()
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoModalType, setInfoModalType] = useState<'informacion' | 'descripcion' | 'condiciones'>('informacion')
  const isAgotado = producto?.stock_de_productos?.length === 0
  const { data: configuracion } = useConfiguracionSistema()
  const precio_producto = user ? producto.precio_vendedor : producto.precio_publico
  return (
    <div className='card-container'>
      <svg style={{ position: 'absolute', width: '0', height: '0' }}>
        <filter id="unopaq" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 5 0"
          ></feColorMatrix>
        </filter>
        <filter id="unopaq2" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 0 0 
            0 1 0 0 0 
            0 0 1 0 0 
            0 0 0 10 0"
          ></feColorMatrix>
        </filter>
        <filter id="unopaq3" y="-100%" height="300%" x="-100%" width="300%">
          <feColorMatrix
            values="1 0 0 1 0 
            0 1 0 1 0 
            0 0 1 1 0 
            0 0 0 2 0"
          ></feColorMatrix>
        </filter>
      </svg>
      <div className="card-container md:h-[410px] h-[340px] w-44 md:w-56">
        <div className="spin spin-blur"></div>
        <div className="spin spin-intense"></div>
        <div className="card-border">
          <div className="spin spin-inside"></div>
        </div>
        <Card className='relative  overflow-hidden rounded-md max-w-sm pt-0 gap-4 flex flex-col h-full'>
          <CardHeader className="relative z-0 p-0 -mt-0 ">
            <img src={getProxiedImageUrl(producto.imagen_url)} alt={producto.nombre} className='w-full -mt-9 md:-mt-4 h-44 object-contain ' />
            <div className='flex items-center gap-1 mt-0 px-4'>

              {producto.nuevo && (
                <Badge className='bg-green-500' >Nuevo</Badge>
              )}
            </div>
            <div className="absolute  flex-col right-2 top-2 flex gap-1">
              <div className="flex flex-col -space-y-px rounded-md shadow-xs">
                <Button
                  className="rounded-none shadow-none size-6 first:rounded-t-md last:rounded-b-md focus-visible:z-10"
                  variant="secondary"
                  size="icon"
                  aria-label="Información del Producto"
                  onClick={() => {
                    setInfoModalType('informacion')
                    setInfoModalOpen(true)
                  }}
                >
                  <IconHeartHandshake size={12} />
                </Button>
                <Button
                  className="rounded-none shadow-none size-6 first:rounded-t-md last:rounded-b-md focus-visible:z-10"
                  variant="secondary"
                  size="icon"
                  aria-label="Descripción del Producto"
                  onClick={() => {
                    setInfoModalType('descripcion')
                    setInfoModalOpen(true)
                  }}
                >
                  <IconFileInfo size={12} />
                </Button>
                <Button
                  className="rounded-none shadow-none size-6 first:rounded-t-md last:rounded-b-md focus-visible:z-10"
                  variant="secondary"
                  size="icon"
                  aria-label="Condiciones del Producto"
                  onClick={() => {
                    setInfoModalType('condiciones')
                    setInfoModalOpen(true)
                  }}
                >
                  <IconHandClick size={12} />
                </Button>
              </div>

            </div>
          </CardHeader>
          {producto.stock_de_productos.length > 0 && (
            <div className="absolute top-0 left-0 z-50">
              <div
                className="bg-blue-600  text-white px-5 py-1 text-xs font-bold shadow-xl dark:shadow-white/30 shadow-black/30 whitespace-nowrap"
                style={{
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  position: 'relative',
                  left: '-23px',
                  top: '10px'
                }}
              >
                En stock
              </div>
            </div>
          )}

          {producto.disponibilidad === 'a_pedido' && (
            <div className="absolute top-0 left-0 z-50">
              <div
                className="bg-green-600  text-white px-5 py-1 text-xs font-bold shadow-xl dark:shadow-white/30 shadow-black/30 whitespace-nowrap"
                style={{
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  position: 'relative',
                  left: '-23px',
                  top: '10px'
                }}
              >
                A pedido
              </div>
            </div>
          )}
          {producto.disponibilidad === 'activacion' && (
            <div className="absolute top-0 left-0 z-50">
              <div
                className="bg-purple-600  text-white px-5 py-1 text-xs font-bold shadow-xl dark:shadow-white/30 shadow-black/30 whitespace-nowrap"
                style={{
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center',
                  position: 'relative',
                  left: '-25px',
                  top: '14px'
                }}
              >
                Activación
              </div>
            </div>
          )}
          <CardContent className='flex flex-col px-4 flex-grow'>
            <span className="text-xs text-gray-500 font-semibold  mb-1">{producto.usuarios.usuario.toUpperCase()}</span>
            <span className="font-bold  mb-1 hidden md:block  leading-tight">{producto.nombre}</span>
            <span className="font-bold md:text-lg text-sm mb-1 md:hidden truncate  leading-tight">{producto.nombre}</span>
            <div className="md:flex flex-row hidden justify-between items-center w-full mb-2">
              {producto.renovable ? (
                <span className="text-xs text-green-600 ">Renovable: <strong>$ {producto.precio_renovacion?.toFixed(2)}</strong></span>
              ) : (
                <span className="text-xs text-red-600 ">No renovable</span>
              )}
            </div>


            {/* Stock y precios */}
            <div className="flex flex-col md:flex-row justify-between md:items-center w-full ">
              <Badge>Stock: {producto.stock_de_productos.length} </Badge>

              <div className='flex md:flex-col flex-row-reverse justify-between md:justify-start items-center'>
                <span className="font-bold md:text-xl text-foreground">${precio_producto.toFixed(2)}</span><span className="text-xs text-muted-foreground">S/.{(precio_producto * (configuracion?.conversion ?? 1)).toFixed(2)}</span>
              </div>
            </div>

          </CardContent>
          <CardFooter className='px-4'>
            <Button className={`w-full ${isAgotado ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-700 hover:bg-blue-800'}`} onClick={() => setOpen(true)} disabled={isAgotado}>
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
      </div>
    </div>
  )
}
