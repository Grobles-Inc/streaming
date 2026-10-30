import { useState, useMemo, useCallback, useEffect } from 'react'
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
import { useResumenCategorias } from '../queries'
import { useProductos } from '../queries/productos'
import { useConfiguracionSistema } from '../queries'
import { ResumenCategoria } from '../services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Home() {
  const { getProxiedImageUrl } = useImageProxy()
  const { searchInput, setSearchInput } = useSearch()

  // Estados para productos
  const [currentProductPage, setCurrentProductPage] = useState(1)
  const { data: productos, isLoading: loadingProductos } =
    useProductos(currentProductPage)
  const [allProductos, setAllProductos] = useState<any[]>([])

  // Categorías (sin paginación)
  const { data: categorias, isLoading: loadingCategorias } = useResumenCategorias()

  // Carrusel de banners
  const { data: configuracion } = useConfiguracionSistema()
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerImages = (configuracion?.banner_images_urls as string[] | null) ?? []

  // Selector de categoría activo
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const categoriasData = categorias || []

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

  // Productos filtrados por categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    let resultado = allProductos
    if (focusedCategory) {
      resultado = resultado.filter((p: any) => p.categoria_id === focusedCategory)
    }
    if (searchInput) {
      const q = searchInput.toLowerCase()
      resultado = resultado.filter((p: any) => p.nombre.toLowerCase().includes(q))
    }
    return resultado
  }, [allProductos, focusedCategory, searchInput])

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

  // Auto-rotar carrusel de banners
  useEffect(() => {
    if (bannerImages.length <= 1) return
    const id = setInterval(() => {
      setBannerIndex((i) => (i + 1) % bannerImages.length)
    }, 5000)
    return () => clearInterval(id)
  }, [bannerImages.length])

  return (
    <div className='bg-base-100 mx-auto min-h-screen max-w-[1500px]'>
      <LandingHeader />

      {/* Carrusel de banners con puntos de control */}
      {bannerImages.length > 0 && (
        <div className='mb-4 w-full overflow-hidden relative'>
          <img
            src={getProxiedImageUrl(bannerImages[bannerIndex % bannerImages.length])}
            alt='Banner'
            className='h-48 w-full object-contain md:h-64'
          />
          {bannerImages.length > 1 && (
            <div className='absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10'>
              {bannerImages.map((_, i) => (
                <button
                  key={i}
                  type='button'
                  onClick={() => setBannerIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === bannerIndex ? 'bg-zinc-800' : 'bg-zinc-300/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scroll horizontal de categorías */}
      {!loadingCategorias && categoriasData.length > 0 && (
        <ScrollArea className='my-4    whitespace-nowrap '>
          <div className='flex h-24 items-center gap-8 rounded-lg px-7'>
            {categoriasData.map((categoria: ResumenCategoria) => (
              <div
                className='w-20 cursor-pointer'
                key={categoria.categoria_id}
                onClick={() => setFocusedCategory(categoria.categoria_id)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img
                      src={getProxiedImageUrl(categoria.categoria_imagen_url)}
                      alt={categoria.categoria_nombre}
                      className='size-16'
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoria.categoria_nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
      )}

      {/* Buscador */}
      <div className='flex justify-center px-4 pt-4 pb-12 md:px-8'>
        <Input
          id='search'
          className='w-80'
          placeholder='¿Qué estás buscando?'
          type='text'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Selector vertical de categorías + catálogo de productos */}
      <div className='flex justify-center gap-8 mt-4 mx-auto max-w-7xl'>
        {!loadingCategorias && categoriasData.length > 0 && !isMobile && (
          <div className='w-96 border rounded-md overflow-hidden'>
            <ul className='divide-y'>
              {categoriasData.map((categoria) => {
                const totalProductos = categoria.total_productos
                return (
                  <li key={categoria.categoria_id}>
                    <Button
                      size='lg'
                      variant={focusedCategory === categoria.categoria_id ? 'secondary' : 'ghost'}
                      className='flex justify-start items-center gap-2 w-full rounded-none'
                      onClick={() => setFocusedCategory(categoria.categoria_id)}
                    >
                      <span>{categoria.categoria_nombre}</span>
                      <span className='text-sm text-zinc-500'>({totalProductos})</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className='flex flex-col w-full gap-4'>
          <h2 className='text-2xl text-center md:text-left font-bold uppercase'>CATALOGO DE PRODUCTOS</h2>
          <div className='grid grid-cols-2 gap-4  lg:grid-cols-3 xl:grid-cols-4'>
            {loadingProductos && currentProductPage === 1 ? (
              // Skeleton loading para productos
              Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-muted h-64 w-full animate-pulse rounded-lg'
                />
              ))
            ) : productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))
            ) : (
              <div className='text-muted-foreground col-span-full py-8 text-center'>
                <div className='flex flex-col items-center justify-center gap-2'>
                  <span className='text-muted-foreground text-base'>
                    {(searchInput || focusedCategory)
                      ? 'No se encontraron productos con esos criterios.'
                      : 'No hay productos disponibles'}
                  </span>
                </div>
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
          {!hasMoreProducts && allProductos.length > 0 && currentProductPage === 1 && (
            <div className='mt-8 flex justify-center py-4'>
              <span className='text-muted-foreground text-sm'>
                Has visto todos los productos disponibles
              </span>
            </div>
          )}

          {/* Soporte por WhatsApp */}
          <div className='mt-12 flex flex-col items-center justify-center gap-3 text-center'>
            <p className='text-sm font-medium text-zinc-600 dark:text-zinc-400'>
              Necesitas ayuda ? Escríbenos por WhatsApp
            </p>
            <a
              href='https://wa.me/51913190401'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2'
            >
              <img
                src='https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000'
                alt='WhatsApp'
                className='size-6'
              />
              <span className='text-green-600 underline text-sm'>913190401</span>
            </a>
          </div>
        </div>
      </div>

      <footer className='text-muted-foreground bg-background my-6 border-t p-6 text-center text-sm'>
        <p>
          © {new Date().getFullYear()} <strong>ML Streaming</strong> <span className='mx-2'>|</span>
          <a
            href='https://groblestudio.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            Desarrollado y mantenido por{' '}
            <span className='font-semibold text-teal-500'>Grobles</span>
          </a>
        </p>
      </footer>
    </div>
  )
}
