import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Billetera = Database['public']['Tables']['billeteras']['Row']
export type BilleteraUpdate = Database['public']['Tables']['billeteras']['Update']

// Create a new compra
export const updateBilleteraProveedorSaldo = async (idBilletera: string, precioProducto: number): Promise<Billetera | null> => {
  const { data : billeteraData, error } = await supabase
    .from('billeteras')
    .select('*')
    .eq('id', idBilletera)
    .single()

  if (error) {
    console.error('Error updating billetera:', error)
    return null
  }

  const { data: billeteraUpdated, error: billeteraError } = await supabase
    .from('billeteras')
    .update({ saldo: billeteraData.saldo + precioProducto })
    .eq('id', idBilletera)
    .select()
    .single()

  if (billeteraError) {
    console.error('Error updating billetera:', billeteraError)
    return null
  }

  return billeteraUpdated
}

