import LandingHeader from '@/components/layout/landing-header'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from '@tanstack/react-router'
import ProductoCard from '../categorias/components/producto-card'
import { useCategorias, useCategoriasPaginated } from '../queries'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { useProductos } from '../queries/productos'
import { Categoria } from '../services'
import CategoriaCard from './categoria-card'
import { useSearch } from '@/stores/searchStore'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { useState, useMemo, useCallback } from 'react'

export default function Home() {
  const { getProxiedImageUrl } = useImageProxy()
  const { searchInput } = useSearch()

  // Estados para productos
  const [currentProductPage, setCurrentProductPage] = useState(1)
  const { data: productos, isLoading: loadingProductos } = useProductos(currentProductPage)
  const [allProductos, setAllProductos] = useState<any[]>([])

  // Estados para categorías
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1)
  const { data: categoriasPaginated, isLoading: loadingCategoriasPaginated } = useCategoriasPaginated(currentCategoryPage)
  const [allCategorias, setAllCategorias] = useState<Categoria[]>([])

  // Acumular productos de todas las páginas cargadas
  useMemo(() => {
    if (productos?.data) {
      if (currentProductPage === 1) {
        setAllProductos(productos.data)
      } else {
        setAllProductos(prev => [...prev, ...productos.data])
      }
    }
  }, [productos?.data, currentProductPage])

  // Acumular categorías de todas las páginas cargadas
  useMemo(() => {
    if (categoriasPaginated?.data) {
      if (currentCategoryPage === 1) {
        setAllCategorias(categoriasPaginated.data)
      } else {
        setAllCategorias(prev => [...prev, ...categoriasPaginated.data])
      }
    }
  }, [categoriasPaginated?.data, currentCategoryPage])

  const filteredProductos = allProductos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchInput.toLowerCase())
  )
  const filteredCategorias = allCategorias.filter((categoria) =>
    categoria.nombre.toLowerCase().includes(searchInput.toLowerCase())
  )

  const hasMoreProducts = productos && allProductos.length < productos.count
  const hasMoreCategorias = categoriasPaginated && allCategorias.length < categoriasPaginated.count

  const loadMoreProducts = useCallback(() => {
    if (hasMoreProducts && !loadingProductos) {
      setCurrentProductPage(prev => prev + 1)
    }
  }, [hasMoreProducts, loadingProductos])

  const loadMoreCategorias = useCallback(() => {
    if (hasMoreCategorias && !loadingCategoriasPaginated) {
      setCurrentCategoryPage(prev => prev + 1)
    }
  }, [hasMoreCategorias, loadingCategoriasPaginated])

  // Infinite scroll hooks
  const { isFetching: isFetchingProducts } = useInfiniteScroll(loadMoreProducts, {
    hasMore: hasMoreProducts,
    isLoading: loadingProductos,
    threshold: 300,
  })

  const { isFetching: isFetchingCategorias } = useInfiniteScroll(loadMoreCategorias, {
    hasMore: hasMoreCategorias,
    isLoading: loadingCategoriasPaginated,
    threshold: 300,
  })
  return (
    <div className="min-h-screen bg-base-100 max-w-[1500px] mx-auto">
      <LandingHeader />
      {!loadingCategoriasPaginated && allCategorias && allCategorias.length > 0 && (
        <ScrollArea className="m-4 rounded-md bg-white border whitespace-nowrap hidden md:block">
          <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
            {allCategorias.map((categoria: Categoria) => (
              <Link className='w-20' key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={getProxiedImageUrl(categoria.imagen_url)} alt={categoria.nombre} className="size-16" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoria.nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
      {searchInput ? (
        <div className="md:px-8 px-4 pb-12 pt-4">
          <h2 className="text-2xl font-bold mb-4">Resultados de la búsqueda</h2>
          {(filteredCategorias && filteredCategorias.length > 0) || (filteredProductos && filteredProductos.length > 0) ? (
            <>
              {filteredCategorias && filteredCategorias.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-2">Categorías</h3>
                  <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 md:gap-4 gap-y-2 items-center justify-center place-items-center mb-8">
                    {filteredCategorias.map((categoria: Categoria) => (
                      <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                        <CategoriaCard categoria={categoria as Categoria} />
                      </Link>
                    ))}
                  </div>
                </>
              )}
              {filteredProductos && filteredProductos.length > 0 && (
                <>
                  <h3 className="text-xl font-semibold mb-2">Productos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 md:gap-6 gap-4">
                    {filteredProductos.map((producto) => (
                      <ProductoCard key={producto.id} producto={producto} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800 mb-2">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  Sin resultados
                </span>
                <span className="text-base text-muted-foreground">No encontramos categorías ni productos que coincidan con tu búsqueda.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 md:gap-4 gap-y-2 items-center justify-center place-items-center">
            {loadingCategoriasPaginated && currentCategoryPage === 1 ? (
              // Skeleton loading para categorías
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="size-[100px] md:size-48 bg-muted animate-pulse rounded-lg" />
              ))
            ) : (
              allCategorias && allCategorias.map((categoria: Categoria) => (
                <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                  <CategoriaCard categoria={categoria as Categoria} />
                </Link>
              ))
            )}
          </div>

          {/* Loading indicator para categorías durante scroll */}
          {(loadingCategoriasPaginated && currentCategoryPage > 1) && (
            <div className="flex justify-center items-center mt-4 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Cargando más categorías...</span>
              </div>
            </div>
          )}

          {/* Indicador cuando no hay más categorías */}
          {!hasMoreCategorias && allCategorias.length > 0 && allCategorias.length >= 20 && (
            <div className="flex justify-center mt-4 py-2">
              <span className="text-muted-foreground text-xs">
                Todas las categorías cargadas
              </span>
            </div>
          )}


          {/* Lista de productos */}
          <div className="md:px-8 px-4 pt-12 pb-12">
            <h2 className="text-2xl font-bold mb-4">Todos los productos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-4">
              {loadingProductos && currentPage === 1 ? (
                // Skeleton loading para productos
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-full bg-muted animate-pulse rounded-lg h-64" />
                ))
              ) : allProductos.length > 0 ? (
                allProductos.map((producto) => (
                  <ProductoCard key={producto.id} producto={producto} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No hay productos disponibles
                </div>
              )}
            </div>

            {/* Loading indicator durante scroll */}
            {(loadingProductos && currentProductPage > 1) && (
              <div className="flex justify-center items-center mt-8 py-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span>Cargando más productos...</span>
                </div>
              </div>
            )}

            {/* Indicador cuando no hay más productos */}
            {!hasMoreProducts && allProductos.length > 0 && (
              <div className="flex justify-center mt-8 py-4">
                <span className="text-muted-foreground text-sm">
                  Has visto todos los productos disponibles
                </span>
              </div>
            )}
          </div>
        </>
      )}
      <footer className="text-center text-sm text-muted-foreground my-6 p-6 border-t bg-background">
        <p>
          © {new Date().getFullYear()} <strong>ML Streaming</strong> . Todos los derechos reservados.
          <span className="mx-2">|</span>
          <a
            href="https://groblesolutions.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sitio Desarrollado por <span className="font-bold  text-yellow-500 transition-colors">Grobles</span>
          </a>

        </p>
      </footer>
    </div>
  )
}
