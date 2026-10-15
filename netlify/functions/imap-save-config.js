/**
 * imap-save-config (TESTING-PHASE, weak auth).
 *
 * The app uses custom auth (public.usuarios + localStorage, no Supabase JWT),
 * so there is no verifiable session token. The frontend sends its user id in
 * `x-user-id` and this function checks it against public.usuarios + stock
 * ownership. A caller can spoof any user id with curl —DO NOT store
 * production email credentials until the Supabase Auth migration lands.
 *
 * Access: admin o proveedor dueño del stock. `registered` y `seller` siempre
 * denegados (desde Fase 5 la config IMAP es responsabilidad del proveedor:
 * se edita en la tabla Pedidos, no en Compras).
 *
 *   POST /.netlify/functions/imap-save-config
 *   headers: x-user-id: <usuarios.id>
 *   body: { stock_producto_id, email, host, port, usuario, password?, ssl, plataforma }
 *
 * `password` es opcional: si viene vacío se reusa el secreto que ya está en
 * Vault (permite cambiar solo la plataforma sin volver a teclear la
 * contraseña, que nunca se devuelve al cliente). Al guardar con password
 * nueva, el secreto anterior se borra de Vault para no dejar huérfanos.
 *
 *   200 { ok: true, id }
 *   4xx { ok: false, reason }
 *
 * La carpeta se eliminó (Fase 5): los correos de verificación van a INBOX y
 * `plataforma` decide qué remitente/asunto se busca.
 */

import { createClient } from '@supabase/supabase-js'
import { ImapFlow } from 'imapflow'

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

/**
 * Plataformas soportadas (Fase 5). La lista real vive en el CHECK constraint
 * `imap_configs_plataforma_check` de Supabase; el <Select> del diálogo usa
 * los mismos slugs. 'otra' = sin filtro de remitente/asunto.
 */
const PLATAFORMAS = [
  'netflix',
  'disney',
  'chatgpt',
  'spotify',
  'amazon_prime',
  'hbo_max',
  'youtube_premium',
  'playstation',
  'xbox',
  'crunchyroll',
  'vix',
  'adobe',
  'canva',
  'otra',
]

function getEnv() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey =
    process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  return { url, serviceKey }
}

function validateBody(b) {
  if (!b || typeof b !== 'object') return 'Cuerpo inválido'
  if (!Number.isInteger(b.stock_producto_id) || b.stock_producto_id < 1)
    return 'stock_producto_id inválido'
  if (typeof b.email !== 'string' || !b.email.includes('@'))
    return 'Email inválido'
  if (typeof b.host !== 'string' || b.host.length < 1) return 'Host requerido'
  if (!Number.isInteger(b.port) || b.port < 1 || b.port > 65535)
    return 'Puerto inválido'
  if (typeof b.usuario !== 'string' || b.usuario.length < 1)
    return 'Usuario requerido'
  // Opcional: si viene vacío se reusa el secreto que ya está en Vault
  // (así se puede cambiar solo la plataforma sin volver a teclearlo).
  if (b.password !== undefined && typeof b.password !== 'string')
    return 'Contraseña inválida'
  if (typeof b.ssl !== 'boolean') return 'ssl debe ser boolean'
  if (typeof b.plataforma !== 'string' || !PLATAFORMAS.includes(b.plataforma))
    return 'Plataforma inválida'
  return null
}

/** Lee el secreto de Vault por id. Solo service_role, nunca sale de la función. */
async function readSecret(admin, vaultId) {
  const { data, error } = await admin
    .schema('vault')
    .from('decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', vaultId)
    .single()
  if (error || !data?.decrypted_secret) return null
  return data.decrypted_secret
}

/**
 * Borra el secreto anterior de la fila. La firma de `delete_secret` cambió
 * entre versiones de supabase_vault (con o sin `ignore_if_missing`), así que
 * se intenta con y sin el flag. Nunca debe tumbar el guardado.
 */
async function deleteSecret(admin, vaultId) {
  if (!vaultId) return
  const attempts = [
    { uuid: vaultId },
    { uuid: vaultId, ignore_if_missing: true },
  ]
  for (const args of attempts) {
    const { error } = await admin.schema('vault').rpc('delete_secret', args)
    if (!error) return
  }
  console.warn('imap-save-config: no se pudo borrar el secreto anterior')
}

async function testImap({ host, port, usuario, password, ssl }) {
  const client = new ImapFlow({
    host,
    port,
    secure: ssl,
    auth: { user: usuario, pass: password },
    logger: false,
    connectionTimeout: 12000,
    greetingTimeout: 8000,
  })
  try {
    await client.connect()
    await client.mailboxOpen('INBOX')
  } finally {
    try {
      await client.close()
    } catch {
      // ignore close errors
    }
    try {
      await client.logout()
    } catch {
      // ignore logout errors after close
    }
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, reason: 'Método no permitido' })
  }

  const { url, serviceKey } = getEnv()
  if (!url || !serviceKey) {
    console.error('imap-save-config: faltan env vars de Supabase')
    return json(500, { ok: false, reason: 'Función no configurada' })
  }

  // Weak identity: trusted client header, verified to exist below. Spoofable.
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

  const validationError = validateBody(body)
  if (validationError) {
    return json(400, { ok: false, reason: validationError })
  }

  const {
    stock_producto_id,
    email,
    host,
    port,
    usuario,
    password,
    ssl,
    plataforma,
  } = body

  const admin = createClient(url, serviceKey)

  // 1. Caller must exist in public.usuarios (custom auth).
  const { data: caller, error: callerError } = await admin
    .from('usuarios')
    .select('id, rol, estado_habilitado')
    .eq('id', callerId)
    .single()
  if (callerError || !caller) {
    return json(401, { ok: false, reason: 'Sesión inválida' })
  }
  if (caller.estado_habilitado === false) {
    return json(403, { ok: false, reason: 'Usuario no habilitado' })
  }
  if (caller.rol === 'registered') {
    return json(403, { ok: false, reason: 'Sin permiso para configurar IMAP' })
  }

  // 2. Scope: solo admin o proveedor dueño del stock (Fase 5: la config IMAP
  // se edita en Pedidos, lado proveedor; el seller ya no configura nada).
  const { data: stock, error: stockError } = await admin
    .from('stock_productos')
    .select('id, proveedor_id')
    .eq('id', stock_producto_id)
    .single()
  if (stockError || !stock) {
    return json(404, { ok: false, reason: 'Cuenta de stock no encontrada' })
  }
  const isAdmin = caller.rol === 'admin'
  const isOwner = stock.proveedor_id === caller.id
  if (!isAdmin && !isOwner) {
    return json(403, {
      ok: false,
      reason: 'Sin acceso a esta cuenta',
    })
  }

  // 3. Config previa de la cuenta (para reusar el secreto si no llega
  // password y para purgar el viejo al reemplazarlo).
  const { data: currentConfig } = await admin
    .from('imap_configs')
    .select('id, password_vault_id')
    .eq('stock_producto_id', stock_producto_id)
    .maybeSingle()
  const previousVaultId = currentConfig?.password_vault_id ?? null

  // 4. Resolver el secreto: nuevo si viene password, si no el de Vault.
  let vaultId = previousVaultId
  let imapPassword = ''
  if (password) {
    const { data: createdId, error: vaultError } = await admin
      .schema('vault')
      .rpc('create_secret', { secret: password })
    if (vaultError || !createdId) {
      console.error('imap-save-config: vault.create_secret falló', vaultError)
      return json(500, { ok: false, reason: 'No se pudo guardar el secreto' })
    }
    vaultId = createdId
    imapPassword = password
  } else if (previousVaultId) {
    imapPassword = (await readSecret(admin, previousVaultId)) ?? ''
    if (!imapPassword) {
      return json(500, {
        ok: false,
        reason:
          'No se encontró la contraseña guardada. Escribe la contraseña para guardarla de nuevo.',
      })
    }
  } else {
    return json(400, { ok: false, reason: 'Contraseña requerida' })
  }

  // 5. Test de conexión IMAP antes de guardar (con el secreto resuelto).
  try {
    await testImap({ host, port, usuario, password: imapPassword, ssl })
  } catch (err) {
    console.warn('imap-save-config: test IMAP falló', err?.message || err)
    return json(400, {
      ok: false,
      reason:
        'No se pudo conectar al correo. Revisa host, puerto, usuario y contraseña.',
    })
  }

  // 6. Upsert config (sin password en claro).
  const { data: saved, error: saveError } = await admin
    .from('imap_configs')
    .upsert(
      {
        stock_producto_id,
        email,
        host,
        port,
        usuario,
        password_vault_id: vaultId,
        ssl,
        plataforma,
        created_by: caller.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stock_producto_id' }
    )
    .select('id')
    .single()
  if (saveError || !saved) {
    console.error('imap-save-config: upsert falló', saveError)
    return json(500, { ok: false, reason: 'No se pudo guardar la configuración' })
  }

  // 7. Purgar el secreto huérfano del guardado anterior (después del upsert,
  // para no dejar la fila apuntando a un secreto borrado).
  if (previousVaultId && previousVaultId !== vaultId) {
    await deleteSecret(admin, previousVaultId)
  }

  return json(200, { ok: true, id: saved.id })
}
