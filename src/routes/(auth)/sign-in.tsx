import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
  /**
   * Carries why someone was bounced away from /sign-up, so the redirect can
   * explain itself instead of looking like a dead link.
   *
   * `redirect` is pre-existing: main.tsx sets it on a 401 to remember where the
   * user was. It is declared here only so adding this schema does not strip it.
   */
  validateSearch: z.object({
    motivo: z.enum(['registro-cerrado']).optional(),
    redirect: z.string().optional(),
  }),
})
