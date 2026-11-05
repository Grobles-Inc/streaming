import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearch } from '@/stores/searchStore'
import { useNavigate, useSearch as useRouterSearch } from '@tanstack/react-router'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import LandingHeader from '@/components/layout/landing-header'
import ProductoCard from '../categorias/components/producto-card'
import { useCategorias, useResumenCategorias } from '../queries'
import { useProductos, useProductosPublicadosByCategoria } from '../queries/productos'
import { useConfiguracionSistema } from '../queries'
import { Categoria, Producto } from '../services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'

const getStockDisponible = (producto: Producto) =>
  Array.isArray(producto.stock_de_productos)
    ? producto.stock_de_productos.length
    : 0

export default function Home() {
  const { getProxiedImageUrl } = useImageProxy()
  const { searchInput, setSearchInput } = useSearch()

  const { data: productos, isLoading: loadingProductos } = useProductos()

  // Categorías (sin paginación)
  const { data: categoriasHorizontales, isLoading: loadingCategoriasHorizontales } =
    useCategorias()
  const { data: categoriasResumen, isLoading: loadingCategoriasResumen } =
    useResumenCategorias()

  // Carrusel de banners
  const { data: configuracion } = useConfiguracionSistema()
  const [bannerIndex, setBannerIndex] = useState(0)
  const bannerImages = (configuracion?.banner_images_urls as string[] | null) ?? []

  // Selector de categoría activo (sincronizado con search param `categoria`)
  const routerSearch = useRouterSearch({ strict: false }) as { categoria?: string }
  const navigate = useNavigate()
  const focusedCategory = routerSearch?.categoria ?? null
  const setFocusedCategory = useCallback(
    (id: string | null) => {
      navigate({ to: '/', search: { categoria: id ?? undefined }, replace: true })
    },
    [navigate]
  )
  const isMobile = useIsMobile()

  const categoriasResumenData = categoriasResumen || []

  const focusedCategoryNombre = useMemo(() => {
    if (!focusedCategory) return null
    const resumen = categoriasResumenData.find(
      (c) => c.categoria_id === focusedCategory
    )
    if (resumen?.categoria_nombre) return resumen.categoria_nombre
    return (
      categoriasHorizontales?.find((c) => c.id === focusedCategory)?.nombre ??
      null
    )
  }, [focusedCategory, categoriasResumenData, categoriasHorizontales])

  const { data: productosCategoria, isLoading: loadingProductosCategoria } =
    useProductosPublicadosByCategoria(focusedCategory)

  const loadingProductosActual = focusedCategory
    ? loadingProductosCategoria
    : loadingProductos

  const totalTodos = useMemo(() => {
    return (categoriasResumen || []).reduce(
      (sum: number, c: any) => sum + (c.total_productos || 0),
      0
    )
  }, [categoriasResumen])

  // Productos ordenados por stock (mayor primero, agotados al final)
  const productosFiltrados = useMemo(() => {
    const resultado: Producto[] = focusedCategory
      ? (productosCategoria ?? [])
      : (productos ?? [])

    const filtrados = searchInput
      ? resultado.filter((producto) =>
          producto.nombre?.toLowerCase().includes(searchInput.toLowerCase())
        )
      : resultado

    return [...filtrados].sort(
      (a, b) => getStockDisponible(b) - getStockDisponible(a)
    )
  }, [productos, focusedCategory, productosCategoria, searchInput])

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
      {!loadingCategoriasHorizontales && (categoriasHorizontales?.length ?? 0) > 0 && (
        <ScrollArea className='my-4    whitespace-nowrap '>
          <div className='flex h-24 items-center gap-8 rounded-lg px-7'>
            {(categoriasHorizontales ?? []).map((categoria: Categoria) => (
              <div
                className='w-20 cursor-pointer'
                key={categoria.id}
                onClick={() => setFocusedCategory(categoria.id)}
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
        {!loadingCategoriasResumen && categoriasResumenData.length > 0 && !isMobile && (
          <div className='w-96 border rounded-md overflow-hidden'>
            <ul className='divide-y'>
              <li key='todos'>
                <Button
                  size='lg'
                  variant={focusedCategory === null ? 'secondary' : 'ghost'}
                  className='flex justify-start items-center gap-2 w-full rounded-none'
                  onClick={() => setFocusedCategory(null)}
                >
                  <span>Todos</span>
                  <span className='text-sm text-zinc-500'>({totalTodos})</span>
                </Button>
              </li>
              {categoriasResumenData.map((categoria) => {
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
          <h2 className='text-2xl text-center md:text-left font-bold uppercase'>
            {focusedCategoryNombre ?? 'Catalogo de productos'}
          </h2>
          <div className='grid grid-cols-2 gap-4  lg:grid-cols-3 xl:grid-cols-4'>
            {loadingProductosActual ? (
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
