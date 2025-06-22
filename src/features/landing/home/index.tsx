import LandingHeader from '@/components/layout/landing-header'
import { Link } from '@tanstack/react-router'
import ProductoCard from '../categorias/producto-card'
import CategoriaCard from './categoria-card'
import { useCategorias } from '../queries'
import { Categoria } from '../services'
import { useProductos } from '../queries/productos'

export default function Home() {
  const { data: categorias } = useCategorias()
  const { data: productos } = useProductos()
  return (
    <div className="min-h-screen bg-base-100">
      <LandingHeader />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6  md:gap-6 gap-2 md:p-6 p-4">
        {categorias?.data.map((categoria) => (
          <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
            <CategoriaCard key={categoria.id} categoria={categoria as Categoria} />
          </Link>

        ))}
      </div>
      <div className="md:px-8 px-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Productos Destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6  md:gap-6 gap-4">
          {productos?.data.filter((producto) => producto.destacado).map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
      <div className="md:px-8 px-4 pt-12 pb-12">
        <h2 className="text-2xl font-bold mb-4">Los más vendidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6  md:gap-6 gap-4">
          {productos?.data.filter((producto) => producto.mas_vendido).map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      </div>

    </div>
  )
}
