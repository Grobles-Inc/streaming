import { createFileRoute } from '@tanstack/react-router'
import Home from '@/features/home/index'

export const Route = createFileRoute('/(public)/')({
  component: Home,
})
