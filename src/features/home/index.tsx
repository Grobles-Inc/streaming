import LandingHeader from '@/components/layout/landing-header'
import { Link } from '@tanstack/react-router'
import ProductoCard from '../categoria/producto-card'
import { categorias, destacados, masVendidos } from '@/data/sample'
import CategoriaCard from './categoria-card'

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Top bar */}
      <LandingHeader />
      {/* Menu as Tabs (responsive) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2 pt-4">
        {categorias.map((tab) => (
          <Link key={tab.tab} to="/categoria/$name" params={{ name: tab.tab.toLowerCase() }}>
            <CategoriaCard key={tab.tab} categoria={tab} />
          </Link>

        ))}
      </div>
      {/* Productos Destacados */}
      <div className="md:px-8 px-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Productos Destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2">
          {destacados.map((service) => (
            <ProductoCard key={service.titulo} producto={service} />
          ))}
        </div>
      </div>
      {/* Los más vendidos */}
      <div className="md:px-8 px-4 pt-12 pb-12">
        <h2 className="text-2xl font-bold mb-4">Los más vendidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2">
          {masVendidos.map((service) => (
            <ProductoCard key={service.titulo} producto={service} />
          ))}
        </div>
      </div>
    </div>
  )
}
