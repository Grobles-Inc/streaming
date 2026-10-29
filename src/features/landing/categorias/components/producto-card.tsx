import { useState } from 'react'
import { useAuth } from '@/stores/authStore'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useConfiguracionSistema } from '../../queries'
import { Producto } from '../../services'
import '../../styles/card.css'
import ComprarProductoModal from './comprar-producto-modal'

export default function ProductoCard({ producto }: { producto: Producto }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const { getProxiedImageUrl } = useImageProxy()

  const stockDisponible = Array.isArray(producto.stock_de_productos)
    ? producto.stock_de_productos.length
    : 0
  const isAgotado = stockDisponible === 0
  const { data: configuracion } = useConfiguracionSistema()
  const precio_producto = user
    ? producto.precio_vendedor
    : producto.precio_publico
  const conversionRate = configuracion?.conversion ?? 1
  const precioSoles = precio_producto * conversionRate

  return (
    <div className='card-container h-auto'>
      <Card className='relative flex h-full flex-col overflow-hidden rounded-xl pt-0 gap-2   '>
        {/* Top Header Section with Image Proxy */}
        <div className='relative flex flex-col items-center'>
          {/* Product Image using getProxiedImageUrl */}
          <img
            src={getProxiedImageUrl(producto.imagen_url)}
                        alt={producto.nombre}
            className='h-32 w-full md:h-42 object-contain'
          />
        </div>

        <div className='flex flex-col items-center gap-2'>
          {/* Stock status badge banner  */}
          {stockDisponible > 0 && (
            <div className='w-1/2 bg-teal-600/20 rounded text-center'>
              <span className='text-[11px] font-black tracking-widest  uppercase'>
                EN STOCK
              </span>
            </div>
          )}
          {producto.disponibilidad === 'a_pedido' && (
            <div className='w-1/2 rounded bg-green-500/20  text-center'>
              <span className='text-[11px] font-black tracking-widest uppercase'>
                A PEDIDO
              </span>
            </div>
          )}
          {producto.disponibilidad === 'activacion' && (
            <div className='w-1/2 rounded  bg-purple-600/20 text-center'>
              <span className='text-[11px] font-black tracking-widest  uppercase'>
                ACTIVACIÓN
              </span>
            </div>
          )}
        </div>

        <CardContent className='space-y-2'>
          <div className='flex flex-col items-center text-center'>
            <span className='mb-0.5 text-[10px] font-semibold tracking-wider  uppercase'>
              {producto.usuarios?.usuario.toUpperCase() || 'ML_STREAMING'}
            </span>
            <span className='line-clamp-2 text-xs px-2 leading-tight https://mlstreaming.com/.netlify/functions/image-proxy/productos-images/productos/97d2227f-8494-417b-9278-766502480392/1793035516777-0zqb931wi4ui.jpegfont-bold md:text-sm'>
              {producto.nombre}
            </span>
          </div>

          {/* Dual Currency Price Pills Container */}
          <div className='grid w-full grid-cols-1 gap-1.5 md:grid-cols-2'>
            <div className='flex items-center justify-between rounded-md border border-purple-900/50 bg-[#13111c] px-2 py-1'>
              <span className='text-[10px] font-bold text-purple-400'>PEN</span>
              <span className='text-xs font-black text-purple-200'>
                S/. {precioSoles.toFixed(2)}
              </span>
            </div>
            <div className='flex items-center justify-between rounded-md border border-cyan-900/50 bg-[#0b131a] px-2 py-1'>
              <span className='text-[10px] font-semibold text-cyan-400'>
                USD
              </span>
              <span className='text-xs font-semibold text-cyan-200'>
                ${precio_producto.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Renovable info box */}
          <div className='w-full rounded border border-zinc-800 bg-zinc-900/80 py-1 text-center'>
            {producto.renovable ? (
              <span className='text-[9px] font-medium text-yellow-400 md:text-[11px]'>
                RENOVABLE:{' '}
                <strong className='text-yellow-300'>
                  S/.{' '}
                  {(
                    (producto.precio_renovacion ?? precio_producto) *
                    conversionRate
                  ).toFixed(2)}{' '}
                  - $
                  {(producto.precio_renovacion ?? precio_producto).toFixed(2)}
                </strong>
              </span>
            ) : (
              <span className='text-[11px] font-medium text-rose-500'>
                No renovable
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-1 pb-2'>
          <Button
            onClick={() => setOpen(true)}
            disabled={isAgotado}
            className='from-primary w-full bg-linear-to-b to-blue-600'
          >
            COMPRAR
          </Button>
          <span className='text-muted-foreground text-xs'>
            Stock: {stockDisponible}
          </span>
        </CardFooter>
      </Card>

      <ComprarProductoModal
        open={open}
        onOpenChange={setOpen}
        producto={producto}
      />
    </div>
  )
}
