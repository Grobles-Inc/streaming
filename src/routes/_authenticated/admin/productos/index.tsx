import { ProductosPage } from '@/features/admin/productos'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/productos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductosPage />
}
