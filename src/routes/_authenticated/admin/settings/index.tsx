import { createFileRoute } from '@tanstack/react-router'
import { ConfiguracionSistemaPage } from '@/features/admin/configuracion-sistema'

export const Route = createFileRoute('/_authenticated/admin/settings/')({
  component: () => <ConfiguracionSistemaPage />,
})