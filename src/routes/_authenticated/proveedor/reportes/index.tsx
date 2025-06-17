import { createFileRoute } from '@tanstack/react-router'
import { ReportesPage } from '@/features/proveedor/reportes'

export const Route = createFileRoute('/_authenticated/proveedor/reportes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ReportesPage />
}
