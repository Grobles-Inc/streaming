import { createFileRoute } from '@tanstack/react-router'
import Users from '@/features/users'
import { requireRole } from '@/utils/role-guard'

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: Users,
  beforeLoad: () => requireRole(['admin']),
})
