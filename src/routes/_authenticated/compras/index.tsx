import { createFileRoute } from '@tanstack/react-router'
import Compras from '@/features/vendedor/compras'

export const Route = createFileRoute('/_authenticated/compras/')({
  component: Compras,
})
