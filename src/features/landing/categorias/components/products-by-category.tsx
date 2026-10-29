import { Suspense } from 'react'
import { IconDatabaseOff } from '@tabler/icons-react'
import { useProductosByCategoria } from '../../queries'
import ProductoCard from './producto-card'

function ProductsLoading() {
  return (
    <div className='grid grid-cols-2 gap-2 pt-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='bg-card relative w-full max-w-sm gap-4 overflow-hidden rounded-lg pt-0 pb-4 md:gap-6 md:pb-6'
        >
          <div className='px-0'>
            <div className='bg-muted aspect-square animate-pulse rounded-t-lg' />
            <div className='absolute top-2 right-2 flex flex-col gap-1'>
              <div className='bg-muted/80 size-9 animate-pulse rounded-md' />
              <div className='bg-muted/80 size-9 animate-pulse rounded-md' />
              <div className='bg-muted/80 size-9 animate-pulse rounded-md' />
            </div>
          </div>
          <div className='mt-3 flex flex-col space-y-3 px-4'>
            <div className='bg-muted h-3 w-1/4 animate-pulse rounded' />
            <div className='bg-muted h-5 w-3/4 animate-pulse rounded' />
            <div className='flex items-center justify-between'>
              <div className='bg-muted h-4 w-1/4 animate-pulse rounded' />
              <div className='bg-muted h-6 w-1/4 animate-pulse rounded' />
            </div>
            <div className='bg-muted mt-2 h-9 w-full animate-pulse rounded' />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsContent({ categoriaId }: { categoriaId: string }) {
  const { data: productos, isLoading } = useProductosByCategoria(categoriaId)

  if (isLoading) {
    return <ProductsLoading />
  }

  if (productos?.length === 0) {
    return (
      <div className='mt-36 flex h-full flex-col items-center justify-center'>
        <IconDatabaseOff className='text-muted-foreground' size={40} />
        <h3 className='text-lg font-semibold'>No hay productos</h3>
        <p className='text-muted-foreground'>
          No hay productos en stock para esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-2 pt-4 md:grid-cols-4 md:gap-4 lg:grid-cols-4'>
      {productos?.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}

export function ProductsByCategory({ categoriaId }: { categoriaId: string }) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent categoriaId={categoriaId} />
    </Suspense>
  )
}
