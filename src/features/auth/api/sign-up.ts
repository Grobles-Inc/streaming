import { verifyGate } from '@/features/security/api/verify-gate'
import {
  type UserCreateError,
  mapUserCreateError,
} from '@/features/users/api/map-user-create-error'
import { UsersService } from '@/features/users/services/users.service'
import type { SignUpFormData } from '../sign-up/schema'
import {
  SIGNUP_LIMIT_MESSAGE,
  countRecentSignupsFromIp,
  isOverSignupLimit,
} from './ip-signup-limit'
import { getSignupSettings } from './signup-settings'

/**
 * Self service seller registration.
 *
 * The role is pinned here rather than read from the form. That is only as
 * strong as the client: the Supabase anon key is public, so anyone willing to
 * skip this module can still insert a different role straight into `usuarios`.
 * Closing that needs the insert to move behind a server side function using
 * service_role, which is a separate change.
 */
const SIGN_UP_ROLE = 'seller' as const

export type SignUpResult =
  | { ok: true; userId: string; approvalRequired: boolean }
  | ({ ok: false } & UserCreateError)

export async function signUp(
  data: SignUpFormData,
  turnstileToken: string | null
): Promise<SignUpResult> {
  // Re-checked with force, without the cache: a form left open before the admin
  // closed signup must not be able to create an account afterwards.
  const settings = await getSignupSettings({ force: true })
  if (settings.mode !== 'open') {
    return {
      ok: false,
      reason: 'El registro público está cerrado por el momento.',
    }
  }

  const gate = await verifyGate(turnstileToken, 'signup')
  if (!gate.ok) {
    return { ok: false, reason: gate.reason }
  }

  // gate.ip was resolved server side from x-nf-client-connection-ip, so it is
  // the real client address and not something the caller chose.
  const existing = await countRecentSignupsFromIp(gate.ip ?? '')
  if (isOverSignupLimit(gate.ip, existing)) {
    return { ok: false, reason: SIGNUP_LIMIT_MESSAGE }
  }

  const { confirmPassword: _confirm, codigoReferido, ...fields } = data
  const referralCode = codigoReferido?.trim()

  try {
    const user = await UsersService.createUserWithReferral(
      {
        email: fields.email.trim().toLowerCase(),
        nombres: fields.nombres.trim(),
        apellidos: fields.apellidos.trim(),
        usuario: fields.usuario.trim(),
        password: fields.password,
        telefono: fields.telefono || null,
        rol: SIGN_UP_ROLE,
        // Explicit in both branches so this never depends on the column
        // default: false means the account waits for an admin to approve it.
        estado_habilitado: !settings.approvalRequired,
        ip_registro: gate.ip,
      },
      referralCode || undefined
    )

    return {
      ok: true,
      userId: user.id,
      approvalRequired: settings.approvalRequired,
    }
  } catch (error) {
    console.error('Error en el registro:', error)
    return { ok: false, ...mapUserCreateError(error) }
  }
}
