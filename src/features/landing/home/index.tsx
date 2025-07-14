import LandingHeader from '@/components/layout/landing-header'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Link } from '@tanstack/react-router'
import ProductoCard from '../categorias/components/producto-card'
import { useCategorias } from '../queries'
import { useProductos } from '../queries/productos'
import { Categoria } from '../services'
import CategoriaCard from './categoria-card'
import { useSearch } from '@/stores/searchStore'

export default function Home() {
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const { data: productos, isLoading: loadingProductos } = useProductos()
  const { searchInput } = useSearch()
  const filteredProductos = productos?.data.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchInput.toLowerCase())
  )
  return (
    <div className="min-h-screen bg-base-100 max-w-[1500px] mx-auto">
      <LandingHeader />
      {!loadingCategorias && categorias && categorias.length > 0 && (
        <ScrollArea className="m-4 rounded-md bg-white border whitespace-nowrap hidden md:block">
          <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
            {categorias.map((categoria: Categoria) => (
              <Link className='w-20' key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={categoria.imagen_url || ''} alt={categoria.nombre} className="size-16" />
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
      {searchInput && (
        <div className="md:px-8 px-4 pb-12 pt-4">
          <h2 className="text-2xl font-bold mb-4">Resultados de la búsqueda</h2>
          {filteredProductos && filteredProductos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 md:gap-6 gap-4">
              {filteredProductos.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
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
                <span className="text-base text-muted-foreground">No encontramos productos que coincidan con tu búsqueda.</span>
              </div>
            </div>
          )}
        </div>
      )}




      <div className="grid grid-cols-4 lg:grid-cols-7  md:gap-4 gap-2 md:p-4 ">
        {loadingCategorias ? (
          // Skeleton loading para categorías
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="size-[100px] md:size-48 bg-muted animate-pulse rounded-lg" />
          ))
        ) : (
          categorias && categorias.map((categoria: Categoria) => (
            <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
              <CategoriaCard categoria={categoria as Categoria} />
            </Link>
          ))
        )}
      </div>


      {/* Lista de productos */}
      <div className="md:px-8 px-4 pt-12 pb-12">
        <h2 className="text-2xl font-bold mb-4">Todos los productos</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 md:gap-6 gap-4">
          {loadingProductos ? (
            // Skeleton loading para productos
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full bg-muted animate-pulse rounded-lg h-64" />
            ))
          ) : productos?.data && productos.data.length > 0 ? (
            productos.data.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No hay productos disponibles
            </div>
          )}
        </div>
      </div>
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
