import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLatestCompras } from '../../compras/queries'
import { compraSchema } from '../../compras/data/schema'

export function ComprasRecientes() {
  const { data: compras } = useLatestCompras()
  const comprasList = compras?.map(compra => compraSchema.parse(compra)) ?? []

  return (
    <div className='space-y-8'>
      {comprasList.map((compra) => (
        <div key={compra.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src='/avatars/01.png' alt='Avatar' />
            <AvatarFallback>
              {compra.productos?.nombre.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium'>{compra.productos?.nombre}</p>
              <p className='text-muted-foreground text-sm'>
                {new Date(compra.fecha_inicio).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className='font-medium'>${compra.precio}</div>
          </div>
        </div>
      ))}
    </div>
  )
}