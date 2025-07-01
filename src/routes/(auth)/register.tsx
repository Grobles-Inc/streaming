import { createFileRoute } from '@tanstack/react-router'
import RegisterWithReferralPage from '@/features/auth/register-with-referral'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterWithReferralPage,
})
