import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Billetera = Database['public']['Tables']['billeteras']['Row']
export type BilleteraInsert = Database['public']['Tables']['billeteras']['Insert']
export type BilleteraUpdate = Database['public']['Tables']['billeteras']['Update']

// Create a new billetera
export const createBilletera = async (billetera: BilleteraInsert): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .insert(billetera)
    .select()
    .single()

  if (error) {
    console.error('Error creating billetera:', error)
    return null
  }

  return data
}

// Get billetera by ID
export const getBilleteraById = async (id: string): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching billetera:', error)
    return null
  }

  return data
}

// Get billetera by usuario ID
export const getBilleteraByUsuarioId = async (usuarioId: string): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single()

  if (error) {
    console.error('Error fetching billetera by usuario:', error)
    return null
  }

  return data
}

// Update billetera
export const updateBilletera = async (id: string, updates: BilleteraUpdate): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating billetera:', error)
    return null
  }

  return data
}

// Update billetera saldo
export const updateBilleteraSaldo = async (id: string, nuevoSaldo: number): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .update({ saldo: nuevoSaldo, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating billetera saldo:', error)
    return null
  }

  return data
}

// Delete billetera
export const deleteBilletera = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('billeteras')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting billetera:', error)
    return false
  }

  return true
}

