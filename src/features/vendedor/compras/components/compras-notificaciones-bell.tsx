import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconBell, IconEye } from '@tabler/icons-react'
import { useComprasCuentaActualizada } from '../queries'
import type { CompraCuentaActualizada } from '../services'

interface ComprasNotificacionesBellProps {
  vendedorId: string
  onSelectCompra: (compra: CompraCuentaActualizada) => void
}

/**
 * Campana de notificaciones de cambio de info de cuenta.
 * Lista las compras con `cuenta_actualizada = true` y delega la apertura
 * del detalle al consumidor (toolbar de compras / header del landing).
 */
export function ComprasNotificacionesBell({
  vendedorId,
  onSelectCompra,
}: ComprasNotificacionesBellProps) {
  const { data: compras = [] } = useComprasCuentaActualizada(vendedorId)
  const count = compras.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <IconBell className='h-4 w-4' />
          {count > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]'
            >
              {count}
            </Badge>
          )}
          <span className='sr-only'>Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel className='flex items-center justify-between'>
          <span>Cuentas actualizadas</span>
          {count > 0 && <Badge variant='secondary'>{count}</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {count === 0 ? (
          <div className='text-muted-foreground px-2 py-6 text-center text-sm'>
            Sin notificaciones
          </div>
        ) : (
          compras.map((compra) => (
            <DropdownMenuItem
              key={compra.id}
              onClick={() => onSelectCompra(compra)}
              className='flex items-start gap-2'
            >
              <IconEye className='mt-0.5 h-4 w-4 shrink-0' />
              <div className='flex min-w-0 flex-col'>
                <span className='truncate text-sm font-medium'>
                  {compra.productos?.nombre || `Compra #${compra.id}`}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {compra.stock_productos?.email ||
                    'Datos de cuenta actualizados'}
                </span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
