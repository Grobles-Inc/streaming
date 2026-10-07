import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSignupSettings } from '@/features/auth/api/signup-settings'
import SignUp from '@/features/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
  /**
   * Disables the route itself rather than rendering a form behind a notice, so
   * a bookmarked /sign-up cannot be submitted after the admin closes signup.
   *
   * Client side only: a direct POST to /rest/v1/usuarios with the anon key
   * still bypasses this. Closing that hole needs an RPC, see api/sign-up.ts.
   */
  beforeLoad: async () => {
    const { mode } = await getSignupSettings()

    if (mode === 'open') return

    if (mode === 'invite') {
      // Invitations keep working, only self registration is off.
      throw redirect({ to: '/register' })
    }

    throw redirect({
      to: '/sign-in',
      search: { motivo: 'registro-cerrado' },
    })
  },
})
