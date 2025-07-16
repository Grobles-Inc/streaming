import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type StockProducto = Database['public']['Tables']['stock_productos']['Row']
export type StockProductoInsert = Database['public']['Tables']['stock_productos']['Insert']
export type StockProductoUpdate = Database['public']['Tables']['stock_productos']['Update']


// Get all stock productos
export const getStockProductosIds = async (productoId: number): Promise<number[]> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select('id')
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stock productos:', error)
    return []
  }
  return data?.map((stock) => stock.id as number) || []
}

export const removeIdFromStockProductos = async (productoId: number): Promise<boolean> => {
  const { data: producto, error: fetchError } = await supabase
    .from('productos')
    .select('stock_de_productos')
    .eq('id', productoId)
    .single()

  if (fetchError || !producto) {
    console.error('Error fetching producto:', fetchError)
    return false
  }

  const stockDeProductos = producto.stock_de_productos as { id: number }[]
  const updatedStockProducts = stockDeProductos.slice(1)

  const { error: updateError } = await supabase
    .from('productos')
    .update({
      stock_de_productos: updatedStockProducts
    })
    .eq('id', productoId)


  if (updateError) {
    console.error('Error updating producto:', updateError)
    return false
  }

  return true
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
  pageSize: number = 10
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