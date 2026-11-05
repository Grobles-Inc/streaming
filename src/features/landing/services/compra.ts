import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type RegistrarCompraParams =
  Database['public']['Functions']['registrar_compra']['Args']

/**
 * Compra transaccional: inserta la compra, mueve ambas billeteras, marca el
 * stock como vendido y lo quita del array del producto en una sola transacción.
 * Idempotente por `p_idempotency_key`: un reintento devuelve la misma compra.
 */
export const registrarCompra = async (
  params: RegistrarCompraParams
): Promise<Compra> => {
  const { data, error } = await supabase.rpc('registrar_compra', params)

  if (error) {
    console.error('Error registrando compra:', error)
    throw error
  }

  return data
}
