import { supabase } from '@/lib/supabase'
import type {
  GetStockProveedorParams,
  StockPaginado,
  StockRow,
} from '../data/types'
import { getImapEstadoStock } from './imap'

type GetStockProveedorResponse = {
  total: number
  rows: StockRow[]
}

/**
 * Lista el stock del proveedor con paginación, búsqueda, filtros y ordenamiento
 * resueltos en el servidor por el RPC `get_stock_proveedor`.
 */
export const getStockProveedor = async (
  params: GetStockProveedorParams
): Promise<StockPaginado> => {
  const { data, error } = await supabase.rpc('get_stock_proveedor', {
    p_proveedor_id: params.proveedorId,
    p_page: params.page,
    p_page_size: params.pageSize,
    p_search: params.search || null,
    p_tipo: params.tipo ?? null,
    p_estado: params.estado ?? null,
    p_publicado: params.publicado ?? null,
    p_soporte: params.soporte ?? null,
    p_sort_by: params.sortBy,
    p_sort_dir: params.sortDir,
  })

  if (error) {
    console.error('Error fetching stock paginado:', error)
    throw error
  }

  const result = data as unknown as GetStockProveedorResponse | null
  const rows = result?.rows ?? []

  // Estado IMAP por cuenta de stock (config + compra más reciente). Va en un
  // RPC aparte para no tocar la definición de `get_stock_proveedor`.
  const imapEstado = await getImapEstadoStock(
    params.proveedorId,
    rows.map((row) => row.id)
  )

  const rowsConImap = rows.map((row) => {
    const imap = imapEstado.get(row.id)
    return {
      ...row,
      imap_configurado: imap?.imap_configurado ?? false,
      imap_plataforma: imap?.imap_plataforma ?? null,
      imap_host: imap?.imap_host ?? null,
      imap_port: imap?.imap_port ?? null,
      imap_usuario: imap?.imap_usuario ?? null,
      imap_ssl: imap?.imap_ssl ?? false,
      compra_id: imap?.compra_id ?? null,
      imap_enabled: imap?.imap_enabled ?? false,
    }
  })

  return {
    rows: rowsConImap,
    total: result?.total ?? 0,
  }
}
