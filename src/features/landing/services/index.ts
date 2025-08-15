import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Categoria = Database['public']['Tables']['categorias']['Row']
export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']
export type Producto = Database['public']['Tables']['productos']['Row']
export type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']

// Create a new categoria
export const createCategoria = async (categoria: CategoriaInsert): Promise<Categoria | null> => {
  const { data, error } = await supabase
    .from('categorias')
    .insert(categoria)
    .select()
    .single()

  if (error) {
    console.error('Error creating categoria:', error)
    return null
  }

  return data
}

// Get categoria by ID
export const getCategoriaById = async (id: string): Promise<Categoria | null> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching categoria:', error)
    return null
  }

  return data
}


// Update categoria
export const updateCategoria = async (id: string, updates: CategoriaUpdate): Promise<Categoria | null> => {
  const { data, error } = await supabase
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating categoria:', error)
    return null
  }

  return data
}

// Delete categoria
export const deleteCategoria = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting categoria:', error)
    return false
  }

  return true
}

// Get all categorias
export const getCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error fetching categorias:', error)
    return []
  }

  return data || []
}

// Get categorias with pagination
export const getCategoriasPaginated = async (
  page: number = 1,
  pageSize: number = 50
): Promise<{ data: Categoria[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('categorias')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error fetching paginated categorias:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

export const getConfiguracionActual = async (): Promise<ConfiguracionRow | null> => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error obteniendo configuración:', error)
    return null
  }

  return data
}