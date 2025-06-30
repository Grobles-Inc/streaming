import { createFileRoute } from '@tanstack/react-router'
import { RetirosPage } from '@/features/admin/retiros'

export const Route = createFileRoute('/_authenticated/admin/retiros/')({
  component: RetirosPage,
})

