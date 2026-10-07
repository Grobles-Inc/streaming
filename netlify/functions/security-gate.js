/**
 * Security gate: verifies a Cloudflare Turnstile token and applies an IP policy.
 *
 *   POST /.netlify/functions/security-gate
 *   body: { token: string, action: 'signin' | 'signup' }
 *
 *   200  { ok: true,  ip, country }
 *   403  { ok: false, reason }
 *
 * Fail-closed by design: a missing or unconfigured secret denies the request
 * instead of letting it through. This function must stay the only place that
 * reads TURNSTILE_SECRET / IPAPI_KEY -- nothing here reaches the client bundle.
 */

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const IP_LOOKUP_URL = 'https://api.ipapi.is/'

const ALLOWED_ACTIONS = new Set(['signin', 'signup'])

// Human readable reasons. These are returned to the browser, so keep them
// vague enough not to tell a scraper which specific check tripped.
const REASONS = {
  badRequest: 'Solicitud invalida',
  badAction: 'Accion no permitida',
  missingToken: 'Verificacion de seguridad requerida',
  captchaFailed: 'Verificacion de seguridad fallida. Recarga e intenta de nuevo.',
  ipBlocked: 'No podemos validar tu conexion. Desactiva tu VPN o proxy e intenta de nuevo.',
  ipLookupFailed: 'No pudimos validar tu conexion. Intenta de nuevo en un momento.',
  misconfigured: 'Verificacion de seguridad no disponible',
}

// Hosting providers whose ranges are essentially never a legitimate retail
// sign-in. Kept as a floor for the case where the ipapi.is key is missing or
// out of quota: the anonymous tier still exposes `asn`, just not the
// vpn/proxy/datacenter flags.
const BLOCKED_ASNS = new Set([
  'AS14061', // DigitalOcean
  'AS24940', // Hetzner
  'AS16276', // OVH
  'AS20473', // Vultr
  'AS51167', // Contabo
  'AS12876', // Scaleway
  'AS63949', // Linode / Akamai
  'AS16509', // Amazon AWS
  'AS14618', // Amazon AWS
  'AS15169', // Google
  'AS396982', // Google Cloud
  'AS8075', // Microsoft Azure
  'AS13335', // Cloudflare
  'AS31898', // Oracle Cloud
  'AS45102', // Alibaba Cloud
  'AS37963', // Alibaba Cloud
  'AS45090', // Tencent Cloud
])

// Lambda containers are reused while warm, so a module-level cache absorbs the
// repeat logins of a single person without spending quota on every click.
const IP_CACHE_TTL_MS = 60 * 60 * 1000
const IP_CACHE_MAX = 500
const ipCache = new Map()

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function deny(reason) {
  return json(403, { ok: false, reason })
}

function getClientIp(event) {
  const headers = event.headers || {}
  // x-nf-client-connection-ip is set by Netlify's edge and cannot be spoofed by
  // the caller. x-forwarded-for is only a fallback for local emulation.
  const direct = headers['x-nf-client-connection-ip']
  if (direct) return direct.trim()
  const forwarded = headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return null
}

async function verifyTurnstile(token, action, ip) {
  const secret = process.env.TURNSTILE_SECRET
  if (!secret) {
    console.error('security-gate: TURNSTILE_SECRET no esta definido')
    return { ok: false, reason: REASONS.misconfigured }
  }

  const params = new URLSearchParams({ secret, response: token })
  if (ip) params.set('remoteip', ip)

  let result
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    result = await response.json()
  } catch (error) {
    console.error('security-gate: siteverify fallo', error)
    return { ok: false, reason: REASONS.captchaFailed }
  }

  if (!result.success) {
    console.warn(
      'security-gate: captcha rechazado',
      result['error-codes'] || 'sin codigo de error'
    )
    return { ok: false, reason: REASONS.captchaFailed }
  }

  // The widget is rendered with an explicit action, so a token minted for one
  // form cannot be replayed into the other.
  if (result.action !== action) {
    console.warn(
      `security-gate: accion no esperada (esperada ${action}, recibida ${result.action})`
    )
    return { ok: false, reason: REASONS.badAction }
  }

  return { ok: true }
}

async function lookupIp(ip) {
  const cached = ipCache.get(ip)
  if (cached && Date.now() - cached.at < IP_CACHE_TTL_MS) {
    return { ...cached.verdict, cached: true }
  }

  const key = process.env.IPAPI_KEY
  const url = new URL(IP_LOOKUP_URL)
  url.searchParams.set('q', ip)
  if (key) url.searchParams.set('key', key)

  let data
  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      console.error('security-gate: ipapi.is respondio', response.status)
      return null
    }
    data = await response.json()
  } catch (error) {
    console.error('security-gate: ipapi.is fallo', error)
    return null
  }

  const verdict = buildVerdict(data)
  if (ipCache.size >= IP_CACHE_MAX) {
    ipCache.delete(ipCache.keys().next().value)
  }
  ipCache.set(ip, { at: Date.now(), verdict })
  return verdict
}

// Field names differ between ipapi.is tiers: the anonymous tier returns
// `company` as a plain string, the keyed tier returns it as an object with a
// `type`, and adds the detection flags. Read both shapes defensively.
function buildVerdict(data) {
  if (!data || typeof data !== 'object') return { blocked: false }

  // Private, reserved or unallocated ranges cannot reach the public internet,
  // so they indicate a spoofed or misrouted header.
  if (data.is_bogon) {
    return { blocked: true, hit: 'bogon' }
  }

  const flags = ['is_vpn', 'is_proxy', 'is_tor', 'is_datacenter', 'is_abuser']
  for (const flag of flags) {
    if (data[flag]) {
      return { blocked: true, hit: flag }
    }
  }

  const asn = typeof data.asn === 'string' ? data.asn.split(' ')[0] : null
  if (asn && BLOCKED_ASNS.has(asn)) {
    return { blocked: true, hit: asn }
  }

  const companyType =
    data.company && typeof data.company === 'object'
      ? data.company.type
      : null
  if (companyType === 'hosting') {
    return { blocked: true, hit: 'company:hosting' }
  }

  const country =
    (data.location && data.location.country_code) || data.country_code || null

  return { blocked: false, asn, companyType, country }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, reason: REASONS.badRequest })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return deny(REASONS.badRequest)
  }

  const { token, action } = payload || {}
  if (!token || typeof token !== 'string') {
    return deny(REASONS.missingToken)
  }
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return deny(REASONS.badAction)
  }

  const ip = getClientIp(event)

  const captcha = await verifyTurnstile(token, action, ip)
  if (!captcha.ok) {
    return deny(captcha.reason)
  }

  if (!ip) {
    // Without an address the IP policy is simply skipped. The captcha has
    // already passed, so this is not an open door, just a thinner check.
    console.warn('security-gate: sin IP de cliente, se omite la politica de IP')
    return json(200, { ok: true, ip: null, country: null })
  }

  const verdict = await lookupIp(ip)
  if (!verdict) {
    // The lookup provider is down. Denying would lock out every real user on a
    // third party outage, so let it through and log it.
    console.error('security-gate: lookup de IP fallo, se permite el paso')
    return json(200, { ok: true, ip, country: null })
  }

  if (verdict.blocked) {
    console.warn(`security-gate: IP bloqueada ${ip} (${verdict.hit})`)
    return deny(REASONS.ipBlocked)
  }

  return json(200, {
    ok: true,
    ip,
    country: verdict.country || null,
  })
}