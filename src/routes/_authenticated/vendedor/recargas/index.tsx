import { createFileRoute } from '@tanstack/react-router'
import Recargas from '@/features/vendedor/recargas'

export const Route = createFileRoute('/_authenticated/vendedor/recargas/')({
  component: Recargas,
})
