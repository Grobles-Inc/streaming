import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Billetera = Database['public']['Tables']['billeteras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type BilleteraUpdate = Database['public']['Tables']['billeteras']['Update']

// Get billetera by usuario ID
export const getBilleteraByUsuarioId = async (usuarioId: string): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single()

  if (error) {
    console.error('Error fetching billetera:', error)
    return null
  }

  return data
}

// Update billetera saldo
export const updateBilleteraSaldo = async (
  usuarioId: string, 
  updates: BilleteraUpdate
): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .update(updates)
    .eq('usuario_id', usuarioId)
    .select()
    .single()

  if (error) {
    console.error('Error updating billetera:', error)
    return null
  }

  return data
}

// Agregar fondos a la billetera
export const agregarFondos = async (
  usuarioId: string, 
  monto: number
): Promise<Billetera | null> => {
  // Primero obtenemos el saldo actual
  const billetera = await getBilleteraByUsuarioId(usuarioId)
  if (!billetera) return null

  const nuevoSaldo = billetera.saldo + monto

  return await updateBilleteraSaldo(usuarioId, { saldo: nuevoSaldo })
}

// Retirar fondos de la billetera
export const retirarFondos = async (
  usuarioId: string, 
  monto: number
): Promise<Billetera | null> => {
  // Primero obtenemos el saldo actual
  const billetera = await getBilleteraByUsuarioId(usuarioId)
  if (!billetera) return null

  // Verificar que hay fondos suficientes
  if (billetera.saldo < monto) {
    throw new Error('Fondos insuficientes')
  }

  const nuevoSaldo = billetera.saldo - monto

  return await updateBilleteraSaldo(usuarioId, { saldo: nuevoSaldo })
}

// Get historial de transacciones (desde recargas como ejemplo)
export const getHistorialTransacciones = async (usuarioId: string) => {
  const { data, error } = await supabase
    .from('recargas')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transacciones:', error)
    return []
  }

  return data || []
}

// Get stats de billetera para dashboard
export const getBilleteraStats = async (usuarioId: string) => {
  const billetera = await getBilleteraByUsuarioId(usuarioId)
  const transacciones = await getHistorialTransacciones(usuarioId)

  if (!billetera) {
    return {
      saldoActual: 0,
      totalRecargas: 0,
      transaccionesRecientes: 0
    }
  }

  const totalRecargas = transacciones
    .filter(t => t.estado === 'completado')
    .reduce((sum, t) => sum + t.monto, 0)

  return {
    saldoActual: billetera.saldo,
    totalRecargas,
    transaccionesRecientes: transacciones.slice(0, 5).length
  }
} 