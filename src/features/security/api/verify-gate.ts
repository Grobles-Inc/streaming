import { z } from 'zod'

/**
 * Client side of the security gate. The matching server lives in
 * netlify/functions/security-gate.js.
 */

export const GATE_ACTIONS = ['signin', 'signup'] as const
export type GateAction = (typeof GATE_ACTIONS)[number]

const gateResponseSchema = z.union([
  z.object({
    ok: z.literal(true),
    ip: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  }),
  z.object({
    ok: z.literal(false),
    reason: z.string(),
  }),
])

export type GateResult =
  | { ok: true; ip: string | null; country: string | null }
  | { ok: false; reason: string }

const GATE_URL = '/.netlify/functions/security-gate'
const NETWORK_ERROR =
  'No pudimos validar tu conexion. Revisa tu internet e intenta de nuevo.'
const MISSING_TOKEN =
  'Completa la verificacion de seguridad antes de continuar.'

/**
 * Local vite dev has no Netlify runtime, so the function is not reachable and
 * the SPA rewrite answers with index.html. Skipping the gate keeps local work
 * unblocked; production stays fail-closed because `import.meta.env.DEV` is
 * statically false in a build.
 *
 * Consequence: the per-IP signup limit does not apply locally, since it counts
 * on the address the gate resolves. To exercise it, run `netlify dev`.
 */
export function isGateBypassed(): boolean {
  return import.meta.env.DEV
}

export async function verifyGate(
  token: string | null,
  action: GateAction
): Promise<GateResult> {
  if (isGateBypassed()) {
    return { ok: true, ip: null, country: null }
  }

  if (!token) {
    return { ok: false, reason: MISSING_TOKEN }
  }

  try {
    const response = await fetch(GATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    })

    const parsed = gateResponseSchema.safeParse(await response.json())
    if (!parsed.success) {
      return { ok: false, reason: NETWORK_ERROR }
    }

    if (parsed.data.ok) {
      return {
        ok: true,
        ip: parsed.data.ip ?? null,
        country: parsed.data.country ?? null,
      }
    }

    return { ok: false, reason: parsed.data.reason }
  } catch {
    return { ok: false, reason: NETWORK_ERROR }
  }
}
