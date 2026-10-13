export interface ImapConfigInput {
  stock_producto_id: number
  email: string
  host: string
  port: number
  usuario: string
  password: string
  ssl: boolean
  carpeta: string
}

interface SaveImapConfigResponse {
  ok: boolean
  id?: string
  reason?: string
}

const SAVE_CONFIG_URL = '/.netlify/functions/imap-save-config'
const REQUEST_CODE_URL = '/.netlify/functions/imap-request-code'

export class ImapNeedsConfigError extends Error {
  constructor(message = 'IMAP no configurado para esta cuenta') {
    super(message)
    this.name = 'ImapNeedsConfigError'
  }
}

export interface RequestCodeResult {
  codigo: string
  solicitud_id: string
  remitente: string | null
  asunto: string | null
}

/**
 * Guarda la config IMAP vía Netlify Function (test de conexión + Vault
 * server-side). El password nunca toca Supabase directo desde el cliente.
 *
 * Testing-phase: la función identifica al caller por x-user-id (custom auth,
 * spoofable). No usar con credenciales de producción hasta migrar a Auth.
 */
export const saveImapConfig = async (
  input: ImapConfigInput,
  userId: string
): Promise<string> => {
  if (!userId) {
    throw new Error('Sesión requerida')
  }

  let response: Response
  try {
    response = await fetch(SAVE_CONFIG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error(
      'No se pudo contactar la función. Si estás en local, ejecuta con `netlify dev`.'
    )
  }

  let parsed: SaveImapConfigResponse
  try {
    parsed = (await response.json()) as SaveImapConfigResponse
  } catch {
    throw new Error(
      'Respuesta inválida de la función. Si estás en local, ejecuta con `netlify dev`.'
    )
  }

  if (!response.ok || !parsed.ok || !parsed.id) {
    throw new Error(parsed.reason || 'No se pudo guardar la configuración')
  }

  return parsed.id
}

/**
 * Solicita el código de verificación real vía Netlify Function (lectura IMAP
 * server-side, sincrónica). Lanza ImapNeedsConfigError si la cuenta no tiene
 * IMAP configurado, para que el diálogo ofrezca configurarlo.
 */
export const requestCode = async (
  compraId: number,
  userId: string
): Promise<RequestCodeResult> => {
  if (!userId) {
    throw new Error('Sesión requerida')
  }

  let response: Response
  try {
    response = await fetch(REQUEST_CODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ compra_id: compraId }),
    })
  } catch {
    throw new Error(
      'No se pudo contactar la función. Si estás en local, ejecuta con `netlify dev`.'
    )
  }

  let parsed: {
    ok: boolean
    codigo?: string
    solicitud_id?: string
    remitente?: string | null
    asunto?: string | null
    reason?: string
    needs_config?: boolean
  }
  try {
    parsed = await response.json()
  } catch {
    throw new Error(
      'Respuesta inválida de la función. Si estás en local, ejecuta con `netlify dev`.'
    )
  }

  if (!response.ok || !parsed.ok) {
    if (parsed.needs_config) {
      throw new ImapNeedsConfigError(parsed.reason)
    }
    throw new Error(parsed.reason || 'No se pudo obtener el código')
  }

  if (!parsed.codigo || !parsed.solicitud_id) {
    throw new Error('Respuesta incompleta de la función')
  }

  return {
    codigo: parsed.codigo,
    solicitud_id: parsed.solicitud_id,
    remitente: parsed.remitente ?? null,
    asunto: parsed.asunto ?? null,
  }
}
