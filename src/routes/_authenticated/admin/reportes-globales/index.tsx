import { createFileRoute } from '@tanstack/react-router'
import { ReportesGlobalesPage } from '@/features/admin/reportes-globales'

export const Route = createFileRoute('/_authenticated/admin/reportes-globales/')({
  component: () => <ReportesGlobalesPage />,
})