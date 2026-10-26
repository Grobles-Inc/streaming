import { invokeSupabaseFunction } from '@/lib/supabase-functions'

const REQUEST_CODE_FN = 'imap-request-code'

export class ImapNeedsConfigError extends Error {
  constructor(message = 'La cuenta de esta compra no tiene IMAP configurado') {
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

export interface ImapRawFallback {
  /** Texto plano del correo completo (máx. 3000 caracteres). No es HTML. */
  rawFallback: string
  solicitudId: string | null
  remitente: string | null
  asunto: string | null
  /** Fecha de recepción del correo (ISO). */
  recibidoAt: string | null
}

/**
 * Error cuando sí llegó un correo de la plataforma pero el regex no pudo
 * extraer el código (ej. códigos alfabéticos). Incluye el cuerpo en texto plano
 * para que el usuario lo lea manualmente.
 */
export class ImapCodeNotExtractedError extends Error {
  readonly rawFallback: string
  readonly solicitudId: string | null
  readonly remitente: string | null
  readonly asunto: string | null
  readonly recibidoAt: string | null

  constructor(
    message = 'Llegó el correo pero no pudimos extraer el código automáticamente',
    data: ImapRawFallback
  ) {
    super(message)
    this.name = 'ImapCodeNotExtractedError'
    this.rawFallback = data.rawFallback
    this.solicitudId = data.solicitudId
    this.remitente = data.remitente
    this.asunto = data.asunto
    this.recibidoAt = data.recibidoAt
  }
}

export interface RequestCodeResult {
  codigo: string
  solicitud_id: string
  remitente: string | null
  asunto: string | null
  /** Fecha de recepción del correo (ISO). */
  recibido_at: string | null
  plataforma: string | null
}

/** Body de la Edge Function: mismo contrato que tenía en Netlify. */
interface RequestCodeResponse {
  ok: boolean
  codigo?: string
  solicitud_id?: string | number
  remitente?: string | null
  asunto?: string | null
  recibido_at?: string | null
  plataforma?: string | null
  reason?: string
  needs_config?: boolean
  not_enabled?: boolean
  /**
   * Solo cuando llegó correo de la plataforma pero no se pudo extraer el código.
   * Texto plano (máx. 3000 caracteres), nunca HTML.
   */
  raw_fallback?: string | null
}

/**
 * Solicita el código de verificación real vía Supabase Edge Function (lectura
 * IMAP server-side, sincrónica). Lanza ImapNeedsConfigError /
 * ImapNotEnabledError para que el diálogo muestre el mensaje sin toast.
 *
 * Testing-phase: la función identifica al caller por x-user-id (custom auth,
 * spoofable) y corre con `verify_jwt = false`. No usar con credenciales de
 * producción hasta migrar a Auth. El código vive en el Dashboard de Supabase,
 * no en el repo.
 */
export const requestCode = async (
  compraId: number,
  userId: string
): Promise<RequestCodeResult> => {
  if (!userId) {
    throw new Error('Sesión requerida')
  }

  const { data } = await invokeSupabaseFunction<RequestCodeResponse>(
    REQUEST_CODE_FN,
    { compra_id: compraId },
    userId
  )

  if (!data) {
    throw new Error(
      'No se pudo contactar el servidor. Revisa tu conexión e intenta de nuevo.'
    )
  }

  if (!data.ok) {
    if (data.needs_config) {
      throw new ImapNeedsConfigError(data.reason)
    }
    if (data.not_enabled) {
      throw new ImapNotEnabledError(data.reason)
    }
    // Llegó correo pero no se pudo extraer el código: el diálogo muestra el
    // cuerpo en texto plano para que el usuario lo lea manualmente.
    if (data.raw_fallback) {
      throw new ImapCodeNotExtractedError(
        data.reason ||
          'Llegó el correo pero no pudimos extraer el código automáticamente',
        {
          rawFallback: data.raw_fallback,
          solicitudId:
            data.solicitud_id != null ? String(data.solicitud_id) : null,
          remitente: data.remitente ?? null,
          asunto: data.asunto ?? null,
          recibidoAt: data.recibido_at ?? null,
        }
      )
    }
    throw new Error(data.reason || 'No se pudo obtener el código')
  }

  if (!data.codigo || !data.solicitud_id) {
    throw new Error('Respuesta incompleta de la función')
  }

  return {
    codigo: data.codigo,
    // El id es uuid en la DB, pero la función puede devolverlo numérico.
    solicitud_id: String(data.solicitud_id),
    remitente: data.remitente ?? null,
    asunto: data.asunto ?? null,
    recibido_at: data.recibido_at ?? null,
    plataforma: data.plataforma ?? null,
  }
}