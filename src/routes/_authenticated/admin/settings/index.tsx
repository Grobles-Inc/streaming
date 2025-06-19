import { createFileRoute } from '@tanstack/react-router'
import { ConfiguracionSistemaPage } from '@/features/admin/configuracion-sistema'
import { requireRole } from '@/utils/role-guard'

export const Route = createFileRoute('/_authenticated/admin/settings/')({
  component: () => <ConfiguracionSistemaPage />,
  beforeLoad: () => requireRole(['admin']),
})