import { supabase } from '@/lib/supabase'
import type {
  GetStockProveedorParams,
  StockPaginado,
  StockRow,
} from '../data/types'

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

  return {
    rows: result?.rows ?? [],
    total: result?.total ?? 0,
  }
}
