import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLatestCompras } from '../../compras/queries'
import { compraSchema } from '../../compras/data/schema'
import { useAuth } from '@/stores/authStore'

export function ComprasRecientes() {
  const { user } = useAuth()
  const { data: compras, isLoading } = useLatestCompras(user?.id as string)
  const comprasList = compras?.map(compra => compraSchema.parse(compra)) ?? []

  return (
    <div className='space-y-8'>
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={`loading-${i}`} className='flex items-center gap-4'>
            <div className='h-9 w-9 bg-muted rounded-full animate-pulse' />
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <div className='h-4 bg-muted rounded animate-pulse w-32' />
                <div className='h-3 bg-muted rounded animate-pulse w-20' />
              </div>
              <div className='h-4 bg-muted rounded animate-pulse w-16' />
            </div>
          </div>
        ))
      ) : (
        comprasList.map((compra) => (
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
              <div className='font-medium'>$ {compra.productos?.precio_publico.toFixed(2)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}