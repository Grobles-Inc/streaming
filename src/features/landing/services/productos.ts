import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Producto = Database['public']['Tables']['productos']['Row']
export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']



export const getProductosByCategoria = async (categoriaId: string): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres, apellidos, billetera_id)
    `)
    .eq('categoria_id', categoriaId)

  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }

  return data || []
}


// Get producto by ID
export const getProductoById = async (id: string): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }

  return data
}


// Get all productos
export const getProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }

  return data || []
}

// Get productos with pagination
export const getProductosPaginated = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Producto[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated productos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}