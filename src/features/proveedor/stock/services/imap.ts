import { supabase } from '@/lib/supabase'

export interface ImapEstadoStock {
  imap_configurado: boolean
  imap_plataforma: string | null
  /** Datos de la conexión guardada. El password vive en Vault y no se lee. */
  imap_host: string | null
  imap_port: number | null
  imap_usuario: string | null
  imap_ssl: boolean
  /** Compra más reciente asociada a la cuenta (null si nunca se vendió). */
  compra_id: number | null
  imap_enabled: boolean
}

/**
 * Estado IMAP de las cuentas de stock visibles del proveedor. El RPC valida
 * que cada `stock_producto_id` pertenezca al proveedor.
 */
export const getImapEstadoStock = async (
  proveedorId: string,
  stockIds: number[]
): Promise<Map<number, ImapEstadoStock>> => {
  const estado = new Map<number, ImapEstadoStock>()
  if (!proveedorId || stockIds.length === 0) {
    return estado
  }

  const { data, error } = await supabase.rpc('get_imap_estado_stock', {
    p_proveedor_id: proveedorId,
    p_stock_ids: stockIds,
  })

  if (error) {
    console.error('Error fetching imap estado stock:', error)
    return estado
  }

  for (const row of data ?? []) {
    estado.set(row.stock_producto_id, {
      imap_configurado: row.imap_configurado,
      imap_plataforma: row.plataforma,
      imap_host: row.imap_host,
      imap_port: row.imap_port,
      imap_usuario: row.imap_usuario,
      imap_ssl: row.imap_ssl ?? false,
      compra_id: row.compra_id,
      imap_enabled: row.imap_enabled,
    })
  }

  return estado
}
