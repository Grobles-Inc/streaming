import { createFileRoute } from '@tanstack/react-router'
import { CategoriasPage } from '@/features/admin/categorias'
import { requireRole } from '@/utils/role-guard'

export const Route = createFileRoute('/_authenticated/admin/categories/')({
  component: () => <CategoriasPage />,
  beforeLoad: () => requireRole(['admin']),
})