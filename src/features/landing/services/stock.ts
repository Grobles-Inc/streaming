import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type StockProducto = Database['public']['Tables']['stock_productos']['Row']
export type StockProductoInsert = Database['public']['Tables']['stock_productos']['Insert']
export type StockProductoUpdate = Database['public']['Tables']['stock_productos']['Update']


export const getStockProductosIds = async (productoId: number): Promise<number[]> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select('id')
    .eq('producto_id', productoId)
    .eq('estado', 'disponible')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stock productos:', error)
    return []
  }
  return data?.map((stock) => stock.id as number) || []
}

export const updateStockProductoStatusVendido = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('stock_productos')
    .update({ estado: 'vendido' })
    .eq('id', id)
  return error ? false : true
}

// Get stock productos with pagination
export const getStockProductosPaginated = async (
  page: number = 1,
  pageSize: number = 200
): Promise<{ data: StockProducto[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('stock_productos')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated stock productos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}