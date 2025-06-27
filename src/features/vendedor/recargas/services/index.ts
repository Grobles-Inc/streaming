import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Recarga = Database['public']['Tables']['recargas']['Row']
export type RecargaInsert = Database['public']['Tables']['recargas']['Insert']
export type RecargaUpdate = Database['public']['Tables']['recargas']['Update']

// Create a new recarga
export const createRecarga = async (recarga: RecargaInsert): Promise<Recarga | null> => {
  const { data, error } = await supabase
    .from('recargas')
    .insert(recarga)
    .select()
    .single()

  if (error) {
    console.error('Error creating recarga:', error)
    return null
  }

  return data
}

// Get recarga by ID
export const getRecargaById = async (id: string): Promise<Recarga | null> => {
  const { data, error } = await supabase
    .from('recargas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching recarga:', error)
    return null
  }

  return data
}

// Update recarga
export const updateRecarga = async (id: string, updates: RecargaUpdate): Promise<Recarga | null> => {
  const { data, error } = await supabase
    .from('recargas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating recarga:', error)
    return null
  }

  return data
}

// Recycle recarga
export const reciclarRecarga = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('recargas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error reciclando recarga:', error)
    return false
  }

  return true
}

// Get recargas by vendedor ID
export const getRecargasByVendedorId = async (vendedorId: string): Promise<Recarga[]> => {
  const { data, error } = await supabase
    .from('recargas')
    .select('*')
    .eq('usuario_id', vendedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recargas by vendedor:', error)
    return []
  }

  return data || []
}

export const getRecargasAprobadasByVendedorId = async (vendedorId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('recargas')
    .select('monto')
    .eq('usuario_id', vendedorId)
    .eq('estado', 'aprobado')

  if (error) {
    console.error('Error fetching recargas aprobadas by vendedor:', error)
    return 0
  }

  return data?.reduce((sum, recarga) => sum + (recarga.monto || 0), 0) || 0
}

// Get recargas with pagination
export const getRecargasPaginated = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Recarga[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('recargas')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated recargas:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}
