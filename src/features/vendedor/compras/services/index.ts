import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type CompraInsert = Database['public']['Tables']['compras']['Insert']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']

// Create a new compra
export const createCompra = async (compra: CompraInsert): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .insert(compra)
    .select()
    .single()

  if (error) {
    console.error('Error creating compra:', error)
    return null
  }

  return data
}

// Get compra by ID
export const getCompraById = async (id: string): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching compra:', error)
    return null
  }

  return data
}

// Update compra
export const updateCompra = async (id: string, updates: CompraUpdate): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating compra:', error)
    return null
  }

  return data
}

// Recycle compra
export const reciclarCompra = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('compras')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error reciclando compra:', error)
    return false
  }

  return true
}

// Get compras by vendedor ID
export const getComprasByVendedorId = async (vendedorId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .eq('vendedor_id', vendedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching compras by vendedor:', error)
    return []
  }

  return data || []
}

// Get compras with pagination
export const getComprasPaginated = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Compra[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('compras')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated compras:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}
