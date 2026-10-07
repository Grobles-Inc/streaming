import { supabase } from '@/lib/supabase'

/**
 * Caps how many accounts a single public IP may create.
 *
 * The IP comes from the server side security gate, never from the browser, so
 * it cannot be spoofed by the caller. See api/verify-gate.ts.
 *
 * A rolling window rather than a calendar day: predictable regardless of the
 * user's timezone, and no midnight boundary where an attacker gets a fresh
 * allowance by waiting a few minutes.
 *
 * This counts, so it is still client enforced and can be skipped with a direct
 * POST to /rest/v1/usuarios. Making it atomic needs an RPC that counts and
 * inserts together, which is not written yet.
 */

/** Generous on purpose: mobile carriers put whole neighbourhoods behind one
 * CGNAT address, so a tight limit locks out real users sharing a router. */
const MAX_SIGNUPS_PER_IP_PER_DAY = 3

const WINDOW_MS = 24 * 60 * 60 * 1000

export async function countRecentSignupsFromIp(
  ip: string
): Promise<number | null> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString()

  const { count, error } = await supabase
    .from('usuarios')
    .select('id', { count: 'exact', head: true })
    .eq('ip_registro', ip)
    .gte('created_at', since)

  if (error) {
    // Fail open: a Supabase hiccup should not block every signup on earth.
    console.error('Error contando registros por IP:', error)
    return null
  }

  return count ?? 0
}

export function isOverSignupLimit(
  ip: string | null,
  existing: number | null
): boolean {
  // No resolvable IP means there is nothing to count against.
  if (!ip) return false
  if (existing === null) return false
  return existing >= MAX_SIGNUPS_PER_IP_PER_DAY
}

export const SIGNUP_LIMIT_MESSAGE =
  'Ya se registraron varias cuentas desde esta conexión. Inténtalo más tarde o usá otro número.'

export { MAX_SIGNUPS_PER_IP_PER_DAY }
