import { supabase } from '@/lib/supabase'

/**
 * Availability of the two fields the database treats as unique.
 *
 * Lifted out of the register form so every form that creates a user runs the
 * same checks against the same query shape. Disabled accounts are ignored on
 * purpose: a soft deleted user should not block the address or handle.
 */

export type AvailabilityStatus = 'available' | 'duplicate' | 'error'

const MIN_LENGTH = 3

export async function checkEmailAvailability(
  email: string
): Promise<AvailabilityStatus> {
  const value = email.trim().toLowerCase()
  if (value.length < MIN_LENGTH) return 'available'

  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', value)
    .eq('estado_habilitado', true)
    .maybeSingle()

  if (error) {
    console.error('Error checking email availability:', error)
    return 'error'
  }

  return data ? 'duplicate' : 'available'
}

export async function checkUsernameAvailability(
  usuario: string
): Promise<AvailabilityStatus> {
  const value = usuario.trim()
  if (value.length < MIN_LENGTH) return 'available'

  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .ilike('usuario', value)
    .eq('estado_habilitado', true)
    .maybeSingle()

  if (error) {
    console.error('Error checking username availability:', error)
    return 'error'
  }

  return data ? 'duplicate' : 'available'
}
