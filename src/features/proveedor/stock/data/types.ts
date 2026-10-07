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
