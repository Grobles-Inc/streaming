import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import Home from '@/features/landing/home/index'

export const Route = createFileRoute('/(public)/')({
  validateSearch: z.object({
    categoria: z.string().optional(),
  }),
  component: Home,
})
