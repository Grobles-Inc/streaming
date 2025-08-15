import { createFileRoute } from '@tanstack/react-router'
import Categoria from '@/features/landing/categorias'
import LandingHeader from '@/components/layout/landing-header'
import { useCategorias } from '@/features/landing/queries'


export const Route = createFileRoute('/(public)/categoria/$name')({
  component: CategoriaComponent
})


function CategoriaComponent() {
  const { name } = Route.useParams()
  const { data: categorias } = useCategorias()

  // Find the categoria by name to get the ID
  const categoria = categorias?.find(c => c.nombre.toLowerCase() === name.toLowerCase())
  const categoriaId = categoria?.id || ''

  return (
    <div className='min-h-screen bg-base-100'>
      <LandingHeader />
      <Categoria nombre={name} categoriaId={categoriaId} />
    </div>
  )
}