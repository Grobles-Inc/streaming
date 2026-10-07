/**
 * Turns a Supabase/Postgres error from user creation into something a form can
 * show. Postgres reports a unique violation by naming the constraint, which is
 * the only reliable signal for deciding which field the user got wrong.
 */

export type UserCreateField = 'email' | 'usuario' | 'codigoReferido'

export interface UserCreateError {
  reason: string
  field?: UserCreateField
}

const DUPLICATE_MESSAGES: Record<string, UserCreateError> = {
  email: { reason: 'Este email ya está registrado', field: 'email' },
  usuario: {
    reason: 'Este nombre de usuario ya está en uso',
    field: 'usuario',
  },
}

export function mapUserCreateError(error: unknown): UserCreateError {
  const message = error instanceof Error ? error.message : String(error)

  const constraint = message.match(/unique constraint "([^"]+)"/i)?.[1]
  if (constraint) {
    const lowered = constraint.toLowerCase()
    if (lowered.includes('email')) return DUPLICATE_MESSAGES.email
    if (lowered.includes('usuario') || lowered.includes('user')) {
      return DUPLICATE_MESSAGES.usuario
    }
  }

  // Postgres also words this as "Key (email)=(...) already exists".
  if (/already exists/i.test(message)) {
    if (/email/i.test(message)) return DUPLICATE_MESSAGES.email
    if (/usuario/i.test(message)) return DUPLICATE_MESSAGES.usuario
  }

  if (message.includes('referido')) {
    return {
      reason: 'El código de referido no es válido',
      field: 'codigoReferido',
    }
  }

  if (message.includes('invalid input syntax') && /email/i.test(message)) {
    return { reason: 'Formato de email inválido', field: 'email' }
  }

  return { reason: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }
}
