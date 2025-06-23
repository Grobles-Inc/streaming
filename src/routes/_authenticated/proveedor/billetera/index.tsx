import { createFileRoute } from '@tanstack/react-router'
import { BilleterasPage } from '@/features/proveedor/billetera'

export const Route = createFileRoute('/_authenticated/proveedor/billetera/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <BilleterasPage />
}
