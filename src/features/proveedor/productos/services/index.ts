import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Producto = Database['public']['Tables']['productos']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']


// Create a new producto
export const createProducto = async (producto: ProductoInsert): Promise<Producto> => {
  const { data, error } = await supabase
    .from('productos')
    .insert(producto)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear producto: ${error.message}`)
  }
  return data

}

// Get productos by proveedor ID
export const getProductosByProveedorId = async (proveedorId: string): Promise<(Producto & { categorias?: Categoria })[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      )
    `)
    .eq('proveedor_id', proveedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos by proveedor:', error)
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
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      ),
      usuarios (
        id,
        nombre,
        apellido,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }

  return data
}

// Update producto
export const updateProducto = async (id: string, updates: ProductoUpdate): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      ),
      usuarios (
        id,
        nombre,
        apellido,
        email
      )
    `)
    .single()

  if (error) {
    console.error('Error updating producto:', error)
    return null
  }

  return data
}

// Delete producto
export const deleteProducto = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting producto:', error)
    return false
  }

  return true
}

// Get productos with pagination (for proveedor)
export const getProductosPaginated = async (
  proveedorId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Producto[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      ),
      usuarios (
        id,
        nombre,
        apellido,
        email
      )
    `, { count: 'exact' })
    .eq('proveedor_id', proveedorId)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated productos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

// Get all categorias for dropdowns
export const getCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

  if (error) {
    console.error('Error fetching categorias:', error)
    return []
  }

  return data || []
}

// Get productos stats for proveedor dashboard
export const getProductosStatsByProveedor = async (proveedorId: string) => {
  const { data, error } = await supabase
    .from('productos')
    .select('stock, disponibilidad, destacado, mas_vendido')
    .eq('proveedor_id', proveedorId)

  if (error) {
    console.error('Error fetching productos stats:', error)
    return {
      total: 0,
      enStock: 0,
      destacados: 0,
      masVendidos: 0,
      stockTotal: 0
    }
  }

  const stats = {
    total: data.length,
    enStock: data.filter(p => p.disponibilidad === 'en_stock').length,
    destacados: data.filter(p => p.destacado).length,
    masVendidos: data.filter(p => p.mas_vendido).length,
    stockTotal: data.reduce((sum, p) => sum + p.stock, 0)
  }

  return stats
} 