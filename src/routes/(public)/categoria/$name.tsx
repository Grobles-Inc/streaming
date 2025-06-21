import { createFileRoute } from '@tanstack/react-router'
import Categoria from '@/features/landing/categorias'
import LandingHeader from '@/components/layout/landing-header'


export const Route = createFileRoute('/(public)/categoria/$name')({
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