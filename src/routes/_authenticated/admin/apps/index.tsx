import { createFileRoute } from '@tanstack/react-router'
import Apps from '@/features/apps'

export const Route = createFileRoute('/_authenticated/admin/apps/')({
  component: Apps,
})
