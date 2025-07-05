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
  const categoriasData = categorias || []
  const productosData = productos?.data || []
  const productosDestacados = productosData.filter((producto) => producto.destacado)
  const productosMasVendidos = productosData.filter((producto) => producto.mas_vendido)

  return (
    <div className="min-h-screen bg-base-100 max-w-[1500px] mx-auto">
      <LandingHeader />
      {!loadingCategorias && categoriasData.length > 0 && (
        <ScrollArea className="m-4 rounded-md bg-white border whitespace-nowrap hidden md:block">
          <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
            {categoriasData.map((categoria: Categoria) => (
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


      {
        searchInput && (
          <div className="md:px-8 px-4 pt-12">
            <h2 className="text-2xl font-bold mb-4">Resultados de la búsqueda</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 md:gap-6 gap-4">
              {filteredProductos?.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          </div>
        )
      }




      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-7  gap-4 p-4">
        {loadingCategorias ? (
          // Skeleton loading para categorías
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="size-[100px] md:size-48 bg-muted animate-pulse rounded-lg" />
          ))
        ) : (
          categoriasData.map((categoria: Categoria) => (
            <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
              <CategoriaCard categoria={categoria as Categoria} />
            </Link>
          ))
        )}
      </div>


      {/* Productos Destacados */}
      <div className="md:px-8 px-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Productos Destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 md:gap-6 gap-4">
          {loadingProductos ? (
            // Skeleton loading para productos
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full bg-muted animate-pulse rounded-lg h-64" />
            ))
          ) : productosDestacados.length > 0 ? (
            productosDestacados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No hay productos destacados disponibles
            </div>
          )}
        </div>
      </div>

      {/* Los más vendidos */}
      <div className="md:px-8 px-4 pt-12 pb-12">
        <h2 className="text-2xl font-bold mb-4">Los más vendidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 md:gap-6 gap-4">
          {loadingProductos ? (
            // Skeleton loading para productos
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full bg-muted animate-pulse rounded-lg h-64" />
            ))
          ) : productosMasVendidos.length > 0 ? (
            productosMasVendidos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No hay productos más vendidos disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
