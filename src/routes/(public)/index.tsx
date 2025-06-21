import { createFileRoute } from '@tanstack/react-router'
import Home from '@/features/landing/home/index'

export const Route = createFileRoute('/(public)/')({
  component: Home,
})
