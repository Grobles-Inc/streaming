/**
 * Global switch for how new accounts may be created.
 *
 * - `open`   anyone can self register from /sign-up
 * - `invite` /sign-up is off; only /register with a valid token works
 * - `closed` nobody can register at all
 *
 * `configuracion.signup_mode` is a plain `text` column guarded by the
 * `configuracion_signup_mode_check` constraint, so the generated database types
 * only see it as `string`. This module is the single source of truth for the
 * values the app accepts.
 */
export const SIGNUP_MODES = ['open', 'invite', 'closed'] as const

export type SignupMode = (typeof SIGNUP_MODES)[number]
