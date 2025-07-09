import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import RegisterWithReferralPage from '@/features/auth/register-with-referral'

const registerSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterWithReferralPage,
  validateSearch: registerSearchSchema,
})
