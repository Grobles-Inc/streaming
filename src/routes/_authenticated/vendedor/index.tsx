import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/features/vendedor/dashboard'

export const Route = createFileRoute('/_authenticated/vendedor/')({
  component: Dashboard,
})
