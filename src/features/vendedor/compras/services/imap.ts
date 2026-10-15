const REQUEST_CODE_URL = '/.netlify/functions/imap-request-code'

export class ImapNeedsConfigError extends Error {
  constructor(message = 'IMAP no configurado para esta cuenta') {
    super(message)
    this.name = 'ImapNeedsConfigError'
  }
}

/** Error 403 cuando el proveedor no habilitó la obtención para la compra. */
export class ImapNotEnabledError extends Error {
  constructor(message = 'El proveedor no habilitó la obtención de código') {
    super(message)
    this.name = 'ImapNotEnabledError'
  }
}

export interface RequestCodeResult {
  codigo: string
  solicitud_id: string
  remitente: string | null
  asunto: string | null
  /** Cuerpo completo del correo en texto plano (máx 8000 chars). */
  cuerpo: string | null
  /** Fecha de recepción del correo (ISO). */
  recibido_at: string | null
  plataforma: string | null
}

/**
 * Solicita el código de verificación real vía Netlify Function (lectura IMAP
 * server-side, sincrónica). Lanza ImapNeedsConfigError / ImapNotEnabledError
 * para que el diálogo muestre el mensaje sin toast.
 *
 * Testing-phase: la función identifica al caller por x-user-id (custom auth,
 * spoofable). No usar con credenciales de producción hasta migrar a Auth.
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
    cuerpo?: string | null
    recibido_at?: string | null
    plataforma?: string | null
    reason?: string
    needs_config?: boolean
    not_enabled?: boolean
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
    if (parsed.not_enabled) {
      throw new ImapNotEnabledError(parsed.reason)
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
    cuerpo: parsed.cuerpo ?? null,
    recibido_at: parsed.recibido_at ?? null,
    plataforma: parsed.plataforma ?? null,
  }
}
