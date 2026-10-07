import { ConfigurationService } from '@/services/configuration.service'
import { SIGNUP_MODES, type SignupMode } from '@/types/supabase'
import { supabase } from '@/lib/supabase'

/**
 * Read and write side of the global signup switch.
 *
 * Goes through the ConfigurationService row (`id = '1'`) rather than the
 * newest-row-by-updated_at reader in configuracion-sistema, which the two
 * services disagree about. Unifying those is still pending.
 */

const CACHE_TTL_MS = 30 * 1000

/**
 * Falls back to the column default rather than to 'open'. If the read fails
 * the safest of the three is 'invite': /sign-up stays off and /register still
 * demands a valid token, so a Supabase hiccup does not silently reopen public
 * registration.
 */
const FALLBACK_MODE: SignupMode = 'invite'

let cache: { mode: SignupMode; approvalRequired: boolean; at: number } | null =
  null

export type SignupSettings = {
  mode: SignupMode
  approvalRequired: boolean
}

function isSignupMode(value: unknown): value is SignupMode {
  return SIGNUP_MODES.includes(value as SignupMode)
}

export async function getSignupSettings(
  options: { force?: boolean } = {}
): Promise<SignupSettings> {
  const fresh = cache && Date.now() - cache.at < CACHE_TTL_MS && !options.force
  if (fresh && cache) {
    return { mode: cache.mode, approvalRequired: cache.approvalRequired }
  }

  try {
    // Explicit columns rather than select('*'): the generated types for this
    // table still list a column that does not exist on it.
    const { data, error } = await supabase
      .from('configuracion')
      .select('signup_mode, registro_requiere_aprobacion')
      .eq('id', '1')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Sin fila de configuracion')

    const settings: SignupSettings = {
      mode: isSignupMode(data.signup_mode) ? data.signup_mode : FALLBACK_MODE,
      approvalRequired: Boolean(data.registro_requiere_aprobacion),
    }

    cache = { ...settings, at: Date.now() }
    return settings
  } catch (error) {
    console.error('Error leyendo la configacion de registro:', error)
    return { mode: FALLBACK_MODE, approvalRequired: false }
  }
}

/** Lets the admin toggle invalidate the cache immediately after saving. */
export function clearSignupSettingsCache() {
  cache = null
}

export type SignupSettingsUpdate = {
  mode?: SignupMode
  approvalRequired?: boolean
}

/**
 * Saves the switches. Unlike the other admin settings this deliberately does
 * not go through ConfiguracionService.saveConfiguracion, which inserts a brand
 * new row instead of updating the one these switches are read from.
 */
export async function updateSignupSettings(
  updates: SignupSettingsUpdate
): Promise<boolean> {
  const payload: {
    signup_mode?: string
    registro_requiere_aprobacion?: boolean
  } = {}
  if (updates.mode !== undefined) payload.signup_mode = updates.mode
  if (updates.approvalRequired !== undefined) {
    payload.registro_requiere_aprobacion = updates.approvalRequired
  }
  if (Object.keys(payload).length === 0) return true

  const saved = await ConfigurationService.updateSignupSettings(payload)
  if (saved) clearSignupSettingsCache()
  return saved
}
