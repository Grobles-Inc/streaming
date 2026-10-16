/**
 * imap-request-code (TESTING-PHASE, weak auth + sync V1).
 *
 *   POST /.netlify/functions/imap-request-code
 *   headers: x-user-id: <usuarios.id>
 *   body: { compra_id }
 *
 *   200 { ok: true, codigo, solicitud_id, remitente, asunto, recibido_at, cuerpo, plataforma }
 *   4xx { ok: false, reason }
 *
 * Auth: mismo scope que antes — admin, proveedor dueño, o seller dueño de la
 * compra. `registered` denegado. x-user-id es spoofeable — no usar en
 * producción hasta migrar a Supabase Auth.
 *
 * Flow: valida compras.imap_enabled (toggle del proveedor) -> rate limit
 * liviano -> crea solicitud (pendiente) -> lee secreto de Vault -> conecta
 * IMAP (INBOX) -> busca UNSEEN de últimos 10 min (más nuevos primero) ->
 * filtra por plataforma (remitente/asunto) -> extrae código + cuerpo -> marca
 * email Seen -> escribe codigos_verificacion y responde. El password y el
 * código nunca se loguean.
 */

import { createClient } from '@supabase/supabase-js'
import { ImapFlow } from 'imapflow'

const CODE_RE = /\b\d{4,8}\b/
const SEARCH_WINDOW_MIN = 10
const SCAN_LIMIT = 10
const RATE_LIMIT_COUNT = 5
const RATE_LIMIT_MIN = 5
const CODE_TTL_MIN = 10
const BODY_MAX_CHARS = 8000

/**
 * Keywords por plataforma para decidir si un correo es de ese servicio. Se
 * comparan (case-insensitive) contra remitente + asunto. 'otra' = sin filtro
 * (comportamiento V1: primer código 4-8 dígitos de cualquier correo no leído).
 */
const PLATAFORMA_KEYWORDS = {
  netflix: ['netflix'],
  disney: ['disney'],
  chatgpt: ['openai', 'chatgpt'],
  spotify: ['spotify'],
  amazon_prime: ['amazon', 'primevideo'],
  hbo_max: ['hbo', 'max.com'],
  youtube_premium: ['youtube'],
  playstation: ['playstation', 'sony'],
  xbox: ['xbox', 'microsoft'],
  crunchyroll: ['crunchyroll'],
  vix: ['vix'],
  adobe: ['adobe'],
  canva: ['canva'],
  otra: [],
}

const PLATAFORMA_LABELS = {
  netflix: 'Netflix',
  disney: 'Disney+',
  chatgpt: 'ChatGPT',
  spotify: 'Spotify',
  amazon_prime: 'Amazon Prime',
  hbo_max: 'HBO Max',
  youtube_premium: 'YouTube Premium',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  crunchyroll: 'Crunchyroll',
  vix: 'ViX',
  adobe: 'Adobe',
  canva: 'Canva',
  otra: 'otra plataforma',
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function getEnv() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey =
    process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  return { url, serviceKey }
}

function decodeQuotedPrintable(s) {
  return s
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ')
}

function tryBase64(s) {
  const compact = s.replace(/\s+/g, '')
  if (compact.length < 100 || !/^[A-Za-z0-9+/=]+$/.test(compact)) return ''
  try {
    const decoded = Buffer.from(compact, 'base64').toString('utf8')
    // Sanity: decoded output should look like text, not binary noise.
    if (/[a-zA-Z]{3,}/.test(decoded)) return decoded
  } catch {
    // not base64, ignore
  }
  return ''
}

/** Texto plano del correo: descodifica quoted-printable/base64 y quita HTML. */
function toPlainText(rawBody) {
  const qp = decodeQuotedPrintable(rawBody)
  const b64 = tryBase64(rawBody)
  const text = [stripHtml(qp), stripHtml(b64), stripHtml(rawBody)]
    .filter(Boolean)
    .join('\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return text.length > BODY_MAX_CHARS
    ? `${text.slice(0, BODY_MAX_CHARS)}…`
    : text
}

/** Extracción genérica: primer bloque de 4-8 dígitos (subject + cuerpo). */
function extractCode(subject, plainText) {
  const m = `${subject}\n${plainText}`.match(CODE_RE)
  return m ? m[0] : null
}

/** ¿El correo corresponde a la plataforma configurada? */
function matchesPlataforma(plataforma, subject, fromText) {
  const keywords = PLATAFORMA_KEYWORDS[plataforma]
  if (!keywords || keywords.length === 0) return true
  const haystack = `${fromText} ${subject}`.toLowerCase()
  return keywords.some((k) => haystack.includes(k))
}

function mask(s) {
  if (!s) return '?'
  return s.length <= 2 ? '**' : `${s.slice(0, 2)}***`
}

async function setEstado(admin, solicitudId, estado, error = null) {
  await admin
    .from('codigo_solicitudes')
    .update({ estado, error })
    .eq('id', solicitudId)
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, reason: 'Método no permitido' })
  }

  const { url, serviceKey } = getEnv()
  if (!url || !serviceKey) {
    console.error('imap-request-code: faltan env vars de Supabase')
    return json(500, { ok: false, reason: 'Función no configurada' })
  }

  const headers = event.headers || {}
  const callerId =
    headers['x-user-id'] || headers['X-User-Id'] || headers['x-user-ID']
  if (typeof callerId !== 'string' || callerId.length < 1) {
    return json(401, { ok: false, reason: 'Sesión requerida' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { ok: false, reason: 'Cuerpo inválido' })
  }
  if (!Number.isInteger(body.compra_id) || body.compra_id < 1) {
    return json(400, { ok: false, reason: 'compra_id inválido' })
  }

  const admin = createClient(url, serviceKey)

  // 1. Caller.
  const { data: caller, error: callerError } = await admin
    .from('usuarios')
    .select('id, rol, estado_habilitado')
    .eq('id', callerId)
    .single()
  if (callerError || !caller) {
    return json(401, { ok: false, reason: 'Sesión inválida' })
  }
  if (caller.estado_habilitado === false || caller.rol === 'registered') {
    return json(403, { ok: false, reason: 'Sin permiso para obtener códigos' })
  }

  // 2. Compra + scope: admin, seller dueño de ESTA compra, o proveedor dueño.
  const { data: compra, error: compraError } = await admin
    .from('compras')
    .select(
      'id, vendedor_id, proveedor_id, stock_producto_id, imap_enabled'
    )
    .eq('id', body.compra_id)
    .single()
  if (compraError || !compra) {
    return json(404, { ok: false, reason: 'Compra no encontrada' })
  }
  if (!compra.stock_producto_id) {
    return json(400, { ok: false, reason: 'La compra no tiene cuenta asociada' })
  }
  const allowed =
    caller.rol === 'admin' ||
    compra.vendedor_id === caller.id ||
    compra.proveedor_id === caller.id
  if (!allowed) {
    return json(403, { ok: false, reason: 'Sin acceso a esta compra' })
  }

  // 2b. Toggle del proveedor: si no habilitó la obtención para esta compra,
  // el vendedor no debe ver el botón ni poder pedir el código.
  if (caller.rol !== 'admin' && !compra.imap_enabled) {
    return json(403, {
      ok: false,
      reason:
        'El proveedor no habilitó la obtención de código para esta compra.',
      not_enabled: true,
    })
  }

  // 3. Rate limit liviano: 5 solicitudes / 5 min por compra.
  const windowStart = new Date(
    Date.now() - RATE_LIMIT_MIN * 60 * 1000
  ).toISOString()
  const { count: recentCount, error: countError } = await admin
    .from('codigo_solicitudes')
    .select('id', { count: 'exact', head: true })
    .eq('compra_id', compra.id)
    .gt('created_at', windowStart)
  if (!countError && (recentCount || 0) >= RATE_LIMIT_COUNT) {
    return json(429, {
      ok: false,
      reason: 'Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.',
    })
  }

  // 4. Config IMAP del stock.
  const { data: config, error: configError } = await admin
    .from('imap_configs')
    .select('email, host, port, usuario, password_vault_id, ssl, plataforma')
    .eq('stock_producto_id', compra.stock_producto_id)
    .single()
  if (configError || !config) {
    return json(400, {
      ok: false,
      reason:
        'El proveedor no configuró el acceso al correo de esta cuenta.',
      needs_config: true,
    })
  }
  const plataforma = config.plataforma || 'otra'
  const plataformaLabel = PLATAFORMA_LABELS[plataforma] || plataforma

  // 5. Crear solicitud (auditoría).
  const { data: solicitud, error: solError } = await admin
    .from('codigo_solicitudes')
    .insert({
      compra_id: compra.id,
      stock_producto_id: compra.stock_producto_id,
      estado: 'pendiente',
      created_by: caller.id,
    })
    .select('id')
    .single()
  if (solError || !solicitud) {
    console.error('imap-request-code: no se pudo crear solicitud', solError)
    return json(500, { ok: false, reason: 'No se pudo crear la solicitud' })
  }
  await setEstado(admin, solicitud.id, 'procesando')

  const fail = async (reason, http = 502) => {
    await setEstado(admin, solicitud.id, 'error', reason)
    return json(http, { ok: false, reason, solicitud_id: solicitud.id })
  }

  // 6. Leer secreto de Vault (service_role, en memoria). El esquema `vault` no
  // está expuesto en la API REST (PostgREST responde PGRST106), así que se usa
  // el wrapper security-definer de `public` (20261016_imap_vault_rpcs.sql).
  const { data: imapPassword, error: secretError } = await admin.rpc(
    'imap_vault_read_secret',
    { p_id: config.password_vault_id }
  )
  if (secretError || !imapPassword) {
    console.error('imap-request-code: Vault read falló')
    return fail('No se pudo leer la credencial IMAP.', 500)
  }

  // 7. Conectar IMAP y buscar.
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.ssl,
    auth: { user: config.usuario, pass: imapPassword },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 8000,
  })

  try {
    await client.connect()
    await client.mailboxOpen('INBOX')

    const since = new Date(Date.now() - SEARCH_WINDOW_MIN * 60 * 1000)
    const uids = await client.search({ seen: false, since })
    if (!uids || uids.length === 0) {
      return fail(
        'No llegó ningún correo nuevo en los últimos 10 minutos. Pide el código e intenta de nuevo.',
        404
      )
    }

    const newestFirst = [...uids].sort((a, b) => b - a).slice(0, SCAN_LIMIT)
    let correosDePlataforma = 0
    for await (const msg of client.fetch(newestFirst, {
      envelope: true,
      bodyParts: ['TEXT'],
    })) {
      const subject = msg.envelope?.subject || ''
      const fromAddr = msg.envelope?.from?.[0]?.address || ''
      const fromName = msg.envelope?.from?.[0]?.name || ''
      const fromText = `${fromAddr} ${fromName}`.trim()

      if (!matchesPlataforma(plataforma, subject, fromText)) continue
      correosDePlataforma += 1

      const rawPart = msg.bodyParts?.get('TEXT')
      const rawBody = rawPart ? Buffer.from(rawPart).toString('utf8') : ''
      const cuerpo = toPlainText(rawBody)
      const code = extractCode(subject, cuerpo)
      if (!code) continue

      const from = fromAddr || fromName || null
      const expiraAt = new Date(
        Date.now() + CODE_TTL_MIN * 60 * 1000
      ).toISOString()
      const recibidoAt = msg.envelope?.date
        ? new Date(msg.envelope.date).toISOString()
        : null

      const { error: codeError } = await admin
        .from('codigos_verificacion')
        .insert({
          solicitud_id: solicitud.id,
          codigo: code,
          remitente: from,
          asunto: subject || null,
          cuerpo,
          recibido_at: recibidoAt,
          expira_at: expiraAt,
        })
      if (codeError) {
        console.error('imap-request-code: insert codigo falló', codeError)
        return fail('No se pudo guardar el código.', 500)
      }

      try {
        await client.messageFlagsAdd(msg.uid, ['\\Seen'])
      } catch {
        // non-fatal: el código ya quedó guardado
      }
      await setEstado(admin, solicitud.id, 'listo')
      console.log(
        `imap-request-code: ok solicitud=${solicitud.id} plataforma=${plataforma} code=${mask(code)}`
      )
      return json(200, {
        ok: true,
        codigo: code,
        solicitud_id: solicitud.id,
        remitente: from,
        asunto: subject || null,
        cuerpo,
        recibido_at: recibidoAt,
        plataforma,
      })
    }

    if (correosDePlataforma === 0) {
      return fail(
        `No llegó ningún correo de ${plataformaLabel} en los últimos 10 minutos. Pide el código e intenta de nuevo.`,
        404
      )
    }

    return fail(
      'Se encontraron correos pero sin código de 4 a 8 dígitos.',
      404
    )
  } catch (err) {
    console.warn('imap-request-code: IMAP falló', err?.message || err)
    return fail('No se pudo leer el correo. Revisa la configuración IMAP.')
  } finally {
    try {
      await client.close()
    } catch {
      // ignore
    }
    try {
      await client.logout()
    } catch {
      // ignore
    }
  }
}
