import { createFileRoute } from '@tanstack/react-router'
import { ComprasPage } from '@/features/admin/compras'

export const Route = createFileRoute('/_authenticated/admin/compras/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ComprasPage />
}
