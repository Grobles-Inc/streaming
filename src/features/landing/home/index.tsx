import { useState, useMemo, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { useSearch } from '@/stores/searchStore'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import LandingHeader from '@/components/layout/landing-header'
import ProductoCard from '../categorias/components/producto-card'
import { useCategorias } from '../queries'
import { useProductos } from '../queries/productos'
import { Categoria } from '../services'
import CategoriaCard from './categoria-card'

export default function Home() {
  const { getProxiedImageUrl } = useImageProxy()
  const { searchInput } = useSearch()

  // Estados para productos
  const [currentProductPage, setCurrentProductPage] = useState(1)
  const { data: productos, isLoading: loadingProductos } =
    useProductos(currentProductPage)
  const [allProductos, setAllProductos] = useState<any[]>([])

  // Categorías (sin paginación)
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()

  // Acumular productos de todas las páginas cargadas
  useMemo(() => {
    if ((productos as any)?.data) {
      if (currentProductPage === 1) {
        setAllProductos((productos as any).data)
      } else {
        setAllProductos((prev) => [...prev, ...(productos as any).data])
      }
    }
  }, [(productos as any)?.data, currentProductPage])

  const filteredProductos = allProductos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchInput.toLowerCase())
  )
  const filteredCategorias = (categorias || []).filter((categoria) =>
    categoria.nombre.toLowerCase().includes(searchInput.toLowerCase())
  )

  const hasMoreProducts =
    productos && allProductos.length < (productos as any).count

  const loadMoreProducts = useCallback(() => {
    if (hasMoreProducts && !loadingProductos) {
      setCurrentProductPage((prev) => prev + 1)
    }
  }, [hasMoreProducts, loadingProductos])

  // Infinite scroll hooks
  useInfiniteScroll(loadMoreProducts, {
    hasMore: !!hasMoreProducts,
    isLoading: loadingProductos,
    threshold: 300,
  })
  return (
    <div className='bg-base-100 mx-auto min-h-screen max-w-[1500px]'>
      <LandingHeader />
      {!loadingCategorias && categorias && categorias.length > 0 && (
        <ScrollArea className='m-4 hidden rounded-md border bg-white whitespace-nowrap md:block'>
          <div className='flex h-24 items-center gap-8 rounded-lg px-7'>
            {categorias.map((categoria: Categoria) => (
              <Link
                className='w-20'
                key={categoria.id}
                to='/categoria/$name'
                params={{ name: categoria.nombre.toLowerCase() }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img
                      src={getProxiedImageUrl(categoria.imagen_url)}
                      alt={categoria.nombre}
                      className='size-16'
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoria.nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      )}
      {searchInput ? (
        <div className='px-4 pt-4 pb-12 md:px-8'>
          <h2 className='mb-4 text-2xl font-bold'>Resultados de la búsqueda</h2>
          {(filteredCategorias && filteredCategorias.length > 0) ||
          (filteredProductos && filteredProductos.length > 0) ? (
            <>
              {filteredCategorias && filteredCategorias.length > 0 && (
                <>
                  <h3 className='mb-2 text-xl font-semibold'>Categorías</h3>
                  <div className='mb-8 grid grid-cols-3 place-items-center items-center justify-center gap-y-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-7'>
                    {filteredCategorias.map((categoria: Categoria) => (
                      <Link
                        key={categoria.id}
                        to='/categoria/$name'
                        params={{ name: categoria.nombre.toLowerCase() }}
                      >
                        <CategoriaCard categoria={categoria as Categoria} />
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {filteredProductos && filteredProductos.length > 0 && (
                <>
                  <h3 className='mb-2 text-xl font-semibold'>Productos</h3>
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6 lg:grid-cols-5'>
                    {filteredProductos.map((producto) => (
                      <ProductoCard key={producto.id} producto={producto} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className='text-muted-foreground col-span-full py-8 text-center'>
              <div className='flex flex-col items-center justify-center gap-2'>
                <span className='mb-2 inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800'>
                  <svg
                    className='mr-2 h-5 w-5 text-yellow-500'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='2'
                      fill='none'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M12 8v4m0 4h.01'
                    />
                  </svg>
                  Sin resultados
                </span>
                <span className='text-muted-foreground text-base'>
                  No encontramos categorías ni productos que coincidan con tu
                  búsqueda.
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className='grid grid-cols-3 place-items-center items-center justify-center gap-y-2 md:gap-4 lg:grid-cols-4 xl:grid-cols-7'>
            {loadingCategorias
              ? // Skeleton loading para categorías
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-muted size-[100px] animate-pulse rounded-lg md:size-48'
                  />
                ))
              : categorias &&
                categorias.map((categoria: Categoria) => (
                  <Link
                    key={categoria.id}
                    to='/categoria/$name'
                    params={{ name: categoria.nombre.toLowerCase() }}
                  >
                    <CategoriaCard categoria={categoria as Categoria} />
                  </Link>
                ))}
          </div>

          {/* Lista de productos */}
          <div className='px-4 pt-12 pb-12 md:px-8'>
            <h2 className='mb-4 text-2xl font-bold'>Todos los productos</h2>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6'>
              {loadingProductos && currentProductPage === 1 ? (
                // Skeleton loading para productos
                Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-muted h-64 w-full animate-pulse rounded-lg'
                  />
                ))
              ) : allProductos.length > 0 ? (
                allProductos.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} />
                ))
              ) : (
                <div className='text-muted-foreground col-span-full py-8 text-center'>
                  No hay productos disponibles
                </div>
              )}
            </div>

            {/* Loading indicator durante scroll */}
            {loadingProductos && currentProductPage > 1 && (
              <div className='mt-8 flex items-center justify-center py-4'>
                <div className='text-muted-foreground flex items-center gap-2'>
                  <div className='border-primary h-5 w-5 animate-spin rounded-full border-b-2'></div>
                  <span>Cargando más productos...</span>
                </div>
              </div>
            )}

            {/* Indicador cuando no hay más productos */}
            {!hasMoreProducts && allProductos.length > 0 && (
              <div className='mt-8 flex justify-center py-4'>
                <span className='text-muted-foreground text-sm'>
                  Has visto todos los productos disponibles
                </span>
              </div>
            )}
          </div>
        </>
      )}
      <footer className='text-muted-foreground bg-background my-6 border-t p-6 text-center text-sm'>
        <p>
          © {new Date().getFullYear()} <strong>ML Streaming</strong> . Todos
          los derechos reservados.
          <span className='mx-2'>|</span>
          <a
            href='https://groblesolutions.netlify.app'
            target='_blank'
            rel='noopener noreferrer'
          >
            Sitio Desarrollado por{' '}
            <span className='font-bold text-yellow-500 transition-colors'>
              Grobles
            </span>
          </a>
        </p>
      </footer>
    </div>
  )
}
