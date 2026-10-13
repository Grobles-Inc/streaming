/**
 * imap-save-config (TESTING-PHASE, weak auth).
 *
 * The app uses custom auth (public.usuarios + localStorage, no Supabase JWT),
 * so there is no verifiable session token. The frontend sends its user id in
 * `x-user-id` and this function checks it against public.usuarios + compra
 * scope. A caller can spoof any user id with curl —DO NOT store
 * production email credentials until the Supabase Auth migration lands.
 *
 * Access: admin, proveedor dueño del stock, o seller con compra no
 * reembolsada sobre ese stock. `registered` siempre denegado.
 *
 *   POST /.netlify/functions/imap-save-config
 *   headers: x-user-id: <usuarios.id>
 *   body: { stock_producto_id, email, host, port, usuario, password, ssl, carpeta }
 *
 *   200 { ok: true, id }
 *   4xx { ok: false, reason }
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
  if (typeof b.password !== 'string' || b.password.length < 1)
    return 'Contraseña requerida'
  if (typeof b.ssl !== 'boolean') return 'ssl debe ser boolean'
  if (typeof b.carpeta !== 'string' || b.carpeta.length < 1)
    return 'Carpeta requerida'
  return null
}

async function testImap({ host, port, usuario, password, ssl, carpeta }) {
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
    await client.mailboxOpen(carpeta)
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
    carpeta,
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

  // 2. Acceso por scope de compra: admin, proveedor dueño, o seller con
  // compra vigente sobre ese stock (no reembolsada).
  const { data: stock, error: stockError } = await admin
    .from('stock_productos')
    .select('id, proveedor_id')
    .eq('id', stock_producto_id)
    .single()
  if (stockError || !stock) {
    return json(404, { ok: false, reason: 'Stock no encontrado' })
  }
  const isAdmin = caller.rol === 'admin'
  const isOwner = stock.proveedor_id === caller.id
  let isBuyer = false
  if (!isAdmin && !isOwner && caller.rol === 'seller') {
    const { data: compra, error: compraError } = await admin
      .from('compras')
      .select('id')
      .eq('stock_producto_id', stock_producto_id)
      .eq('vendedor_id', caller.id)
      .neq('estado', 'reembolsado')
      .limit(1)
      .maybeSingle()
    if (!compraError && compra) {
      isBuyer = true
    }
  }
  if (!isAdmin && !isOwner && !isBuyer) {
    return json(403, {
      ok: false,
      reason: 'Sin acceso a esta cuenta',
    })
  }

  // 3. Test de conexión IMAP antes de guardar.
  try {
    await testImap({ host, port, usuario, password, ssl, carpeta })
  } catch (err) {
    console.warn('imap-save-config: test IMAP falló', err?.message || err)
    return json(400, {
      ok: false,
      reason:
        'No se pudo conectar al correo. Revisa host, puerto, usuario y contraseña.',
    })
  }

  // 4. Secreto en Vault (solo service_role).
  const { data: vaultId, error: vaultError } = await admin
    .schema('vault')
    .rpc('create_secret', { secret: password })
  if (vaultError || !vaultId) {
    console.error('imap-save-config: vault.create_secret falló', vaultError)
    return json(500, { ok: false, reason: 'No se pudo guardar el secreto' })
  }

  // 5. Upsert config (sin password en claro).
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
        carpeta,
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

  return json(200, { ok: true, id: saved.id })
}
