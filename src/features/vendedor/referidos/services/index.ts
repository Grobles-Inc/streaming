import { supabase } from '@/lib/supabase'
import { Referido } from '../data/schema'


export const getReferidosByVendedorId = async (vendedorId: string): Promise<Referido[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombres, apellidos, telefono')
    .eq('referido_id', vendedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching referidos by vendedor:', error)
    return []
  }

  return (data || []).map(user => ({
    id: user.id || '',
    nombres: user.nombres || '',
    apellidos: user.apellidos || '',
    telefono: user.telefono || ''
  }))
}
