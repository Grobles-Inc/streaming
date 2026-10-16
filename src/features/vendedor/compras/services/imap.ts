import { invokeSupabaseFunction } from '@/lib/supabase-functions'

const REQUEST_CODE_FN = 'imap-request-code'

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

/** Body de la Edge Function: mismo contrato que tenía en Netlify. */
interface RequestCodeResponse {
  ok: boolean
  codigo?: string
  solicitud_id?: string | number
  remitente?: string | null
  asunto?: string | null
  cuerpo?: string | null
  recibido_at?: string | null
  plataforma?: string | null
  reason?: string
  needs_config?: boolean
  not_enabled?: boolean
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
    cuerpo: data.cuerpo ?? null,
    recibido_at: data.recibido_at ?? null,
    plataforma: data.plataforma ?? null,
  }
}