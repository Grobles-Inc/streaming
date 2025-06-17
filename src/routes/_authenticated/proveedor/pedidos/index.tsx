import { createFileRoute } from '@tanstack/react-router'
import { PedidosPage } from '@/features/proveedor/pedidos'

export const Route = createFileRoute('/_authenticated/proveedor/pedidos/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PedidosPage />
}
