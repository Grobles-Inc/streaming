import { createFileRoute } from '@tanstack/react-router'
import BilleterasPage from '@/features/admin/billeteras/billeteras-page'

export const Route = createFileRoute('/_authenticated/admin/billeteras/')({
  component: BilleterasPage,
})

