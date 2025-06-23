import { createFileRoute } from '@tanstack/react-router'
import { CuentasPage } from '@/features/proveedor/cuentas'

export const Route = createFileRoute('/_authenticated/proveedor/cuentas/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CuentasPage />
}
