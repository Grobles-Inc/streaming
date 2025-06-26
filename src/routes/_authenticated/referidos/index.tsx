import { createFileRoute } from '@tanstack/react-router'
import Referidos from '@/features/vendedor/referidos/index'

export const Route = createFileRoute('/_authenticated/referidos/')({
  component: Referidos,
})
