import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CustomEmpty } from '@/components/custom-empty'
import { useLatestCompras } from '../../compras/queries'
import { compraSchema } from '../../compras/data/schema'
import { useAuth } from '@/stores/authStore'
import { Loader2, ShoppingBag } from 'lucide-react'

export function ComprasRecientes() {
  const { user } = useAuth()
  const { data: compras, isLoading } = useLatestCompras(user?.id as string)
  const comprasList = compras?.map(compra => compraSchema.parse(compra)) ?? []

  if (isLoading) {
    return (
      <div className='flex flex-col items-center gap-6 py-10'>
        <CustomEmpty
          title='Cargando compras...'
          description='Estamos obteniendo tus compras recientes.'
          icon={<Loader2 className='size-10 animate-spin' />}
        />
      </div>
    )
  }

  if (comprasList.length === 0) {
    return (
      <div className='flex flex-col items-center gap-6 py-10'>
        <CustomEmpty
          title='No hay compras recientes'
          description='Aún no tienes compras registradas.'
          icon={<ShoppingBag className='size-10' />}
        />
      </div>
    )
  }

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
                  {compra.fecha_inicio ? new Date(compra.fecha_inicio).toLocaleDateString('es-ES') : ''}
                </p>
              </div>
              <div className='font-medium'>$ {compra.precio.toFixed(2)}</div>
            </div>
          </div>
        ))}
    </div>
  )
}