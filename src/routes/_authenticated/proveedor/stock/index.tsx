import { createFileRoute } from '@tanstack/react-router'
import { StockPage } from '@/features/proveedor/stock'

export const Route = createFileRoute('/_authenticated/proveedor/stock/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StockPage />
}
