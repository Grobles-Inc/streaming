import type { Database } from '@/types/supabase'

export type StockProductoRow =
  Database['public']['Tables']['stock_productos']['Row']

export type StockProductoTipo = 'cuenta' | 'perfiles' | 'combo'
export type StockProductoEstado = 'disponible' | 'vendido'
export type StockProductoSoporte = 'activo' | 'vencido' | 'soporte'

/**
 * Fila que devuelve el RPC `get_stock_proveedor`: los campos de
 * `stock_productos` más el producto relacionado ya resuelto en el servidor.
 */
export type StockRow = StockProductoRow & {
  producto: {
    id: number
    nombre: string
    estado: string
  } | null
  /** Estado IMAP de la cuenta, mergeado desde `get_imap_estado_stock`. */
  imap_configurado: boolean
  imap_plataforma: string | null
  imap_host: string | null
  imap_port: number | null
  imap_usuario: string | null
  imap_ssl: boolean
  /** Compra más reciente de esta cuenta; null si todavía no se vendió. */
  compra_id: number | null
  imap_enabled: boolean
}

// Columnas por las que el RPC `get_stock_proveedor` sabe ordenar
export type StockSortBy =
  | 'created_at'
  | 'id'
  | 'email'
  | 'tipo'
  | 'estado'
  | 'publicado'
  | 'soporte_stock_producto'

export type StockSortDir = 'asc' | 'desc'

export type GetStockProveedorParams = {
  proveedorId: string
  page: number
  pageSize: number
  search: string
  tipo: string | null
  estado: string | null
  publicado: boolean | null
  soporte: string | null
  sortBy: StockSortBy
  sortDir: StockSortDir
}

export type StockPaginado = {
  rows: StockRow[]
  total: number
}
