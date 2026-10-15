import { supabase } from '@/lib/supabase'
import { Plataforma } from '../data/plataformas'

const SAVE_CONFIG_URL = '/.netlify/functions/imap-save-config'

export interface ImapConfigInput {
  stock_producto_id: number
  email: string
  host: string
  port: number
  usuario: string
  /**
   * Opcional: si viene vacío la función reusa el secreto guardado en Vault.
   * Nunca se recupera ni se muestra la contraseña actual.
   */
  password?: string
  ssl: boolean
  plataforma: Plataforma
}

interface SaveImapConfigResponse {
  ok: boolean
  id?: string
  reason?: string
}

/** Estado IMAP de una compra, tal como lo devuelve `get_imap_estado_pedidos`. */
export interface ImapEstadoCompra {
  imap_enabled: boolean
  imap_configurado: boolean
  imap_plataforma: string | null
  /** Datos de la conexión guardada. El password nunca se lee (vive en Vault). */
  imap_host: string | null
  imap_port: number | null
  imap_usuario: string | null
  imap_ssl: boolean
}

/**
 * Guarda la config IMAP de una cuenta de stock vía Netlify Function (test de
 * conexión + Vault server-side). El password nunca toca Supabase directo desde
 * el cliente.
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
 * Estado IMAP (toggle + config) de las compras visibles del proveedor.
 * El RPC valida que las compras pertenezcan al proveedor.
 */
export const getImapEstadoPedidos = async (
  proveedorId: string,
  compraIds: number[]
): Promise<Map<number, ImapEstadoCompra>> => {
  const estado = new Map<number, ImapEstadoCompra>()
  if (!proveedorId || compraIds.length === 0) {
    return estado
  }

  const { data, error } = await supabase.rpc('get_imap_estado_pedidos', {
    p_proveedor_id: proveedorId,
    p_compra_ids: compraIds,
  })

  if (error) {
    console.error('Error fetching imap estado pedidos:', error)
    return estado
  }

  for (const row of data ?? []) {
    estado.set(row.compra_id, {
      imap_enabled: row.imap_enabled,
      imap_configurado: row.imap_configurado,
      imap_plataforma: row.plataforma,
      imap_host: row.imap_host,
      imap_port: row.imap_port,
      imap_usuario: row.imap_usuario,
      imap_ssl: row.imap_ssl ?? false,
    })
  }

  return estado
}

/** Toggle del proveedor: habilita (o no) la obtención de código de la compra. */
export const setImapEnabled = async (
  proveedorId: string,
  compraId: number,
  enabled: boolean
): Promise<boolean> => {
  const { data, error } = await supabase.rpc('set_compras_imap_enabled', {
    p_proveedor_id: proveedorId,
    p_compra_id: compraId,
    p_enabled: enabled,
  })

  if (error) {
    throw new Error(error.message || 'No se pudo actualizar el estado IMAP')
  }

  return data === true
}
