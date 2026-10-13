/**
 * imap-request-code (TESTING-PHASE, weak auth + sync V1).
 *
 *   POST /.netlify/functions/imap-request-code
 *   headers: x-user-id: <usuarios.id>
 *   body: { compra_id }
 *
 *   200 { ok: true, codigo, solicitud_id, remitente, asunto }
 *   4xx { ok: false, reason }
 *
 * Auth: same compra-scope rule as imap-save-config (admin, proveedor dueño,
 * o seller dueño de la compra). `registered` denegado. x-user-id es
 * spoofeable — no usar en producción hasta migrar a Supabase Auth.
 *
 * Flow: rate limit liviano -> crea solicitud (pendiente) -> lee secreto de
 * Vault -> conecta IMAP -> busca UNSEEN de últimos 10 min (más nuevos
 * primero) -> extrae primer \b\d{4,8}\b -> marca email Seen -> escribe
 * codigo + solicitud listo. El password y el código nunca se loguean.
 */

import { createClient } from '@supabase/supabase-js'
import { ImapFlow } from 'imapflow'

const CODE_RE = /\b\d{4,8}\b/
const SEARCH_WINDOW_MIN = 10
const SCAN_LIMIT = 10
const RATE_LIMIT_COUNT = 5
const RATE_LIMIT_MIN = 5
const CODE_TTL_MIN = 10

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

/** Generic V1 extraction: first 4-8 digit run in subject + body. */
function extractCode(subject, rawBody) {
  const qp = decodeQuotedPrintable(rawBody)
  const b64 = tryBase64(rawBody)
  const haystack = [subject, stripHtml(rawBody), stripHtml(qp), stripHtml(b64)]
    .filter(Boolean)
    .join('\n')
  const m = haystack.match(CODE_RE)
  return m ? m[0] : null
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
    .select('id, vendedor_id, proveedor_id, stock_producto_id')
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
    .select('email, host, port, usuario, password_vault_id, ssl, carpeta')
    .eq('stock_producto_id', compra.stock_producto_id)
    .single()
  if (configError || !config) {
    return json(400, {
      ok: false,
      reason: 'IMAP no configurado para esta cuenta. Configúralo primero.',
      needs_config: true,
    })
  }

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

  // 6. Leer secreto de Vault (service_role, en memoria).
  const { data: secretRow, error: secretError } = await admin
    .schema('vault')
    .from('decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', config.password_vault_id)
    .single()
  const imapPassword = secretRow?.decrypted_secret
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
    await client.mailboxOpen(config.carpeta)

    const since = new Date(Date.now() - SEARCH_WINDOW_MIN * 60 * 1000)
    const uids = await client.search({ seen: false, since })
    if (!uids || uids.length === 0) {
      return fail(
        'No llegó ningún correo nuevo en los últimos 10 minutos. Pide el código e intenta de nuevo.',
        404
      )
    }

    const newestFirst = [...uids].sort((a, b) => b - a).slice(0, SCAN_LIMIT)
    for await (const msg of client.fetch(newestFirst, {
      envelope: true,
      bodyParts: ['TEXT'],
    })) {
      const subject = msg.envelope?.subject || ''
      const rawPart = msg.bodyParts?.get('TEXT')
      const rawBody = rawPart ? Buffer.from(rawPart).toString('utf8') : ''
      const code = extractCode(subject, rawBody)
      if (!code) continue

      const from =
        msg.envelope?.from?.[0]?.address ||
        msg.envelope?.from?.[0]?.name ||
        null
      const expiraAt = new Date(
        Date.now() + CODE_TTL_MIN * 60 * 1000
      ).toISOString()

      const { error: codeError } = await admin
        .from('codigos_verificacion')
        .insert({
          solicitud_id: solicitud.id,
          codigo: code,
          remitente: from,
          asunto: subject || null,
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
        `imap-request-code: ok solicitud=${solicitud.id} code=${mask(code)}`
      )
      return json(200, {
        ok: true,
        codigo: code,
        solicitud_id: solicitud.id,
        remitente: from,
        asunto: subject || null,
      })
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
