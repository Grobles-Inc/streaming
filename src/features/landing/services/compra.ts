import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type CompraInsert = Database['public']['Tables']['compras']['Insert']

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
