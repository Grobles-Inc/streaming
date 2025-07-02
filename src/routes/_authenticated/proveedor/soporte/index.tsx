import { createFileRoute } from '@tanstack/react-router'
import { SoportePage } from '@/features/proveedor/soporte'

export const Route = createFileRoute('/_authenticated/proveedor/soporte/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SoportePage />
}
