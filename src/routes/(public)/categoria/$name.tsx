import { createFileRoute } from '@tanstack/react-router'
import Categoria from '@/features/categoria'
import { productos } from '@/features/categoria/data/sample'
import LandingHeader from '@/components/layout/landing-header'

const getProductos = (categoria: string) => {
  return productos.filter(producto => producto.categoria === categoria)
}

export const Route = createFileRoute('/(public)/categoria/$name')({
  loader: async ({ params }) => {
    const productos = getProductos(params.name)
    return { productos }
  },
  component: CategoriaComponent
})


function CategoriaComponent() {
  const { name } = Route.useParams()
  return (
    <div className='min-h-screen bg-base-100'>
      <LandingHeader />
      <Categoria nombre={name} />
    </div>
  )
}