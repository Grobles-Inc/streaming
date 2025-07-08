import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'


export type Referido = Database['public']['Tables']['usuarios']['Row']

export const getReferidosByVendedorId = async (vendedorId: string): Promise<Referido[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, usuarios:referido_id(codigo_referido)')
    .eq('referido_id', vendedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching referidos by vendedor:', error)
    return []
  }

  return data || []
}
