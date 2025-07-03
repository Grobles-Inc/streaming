import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { getConfiguracionActual, getAdministrador } from '@/features/proveedor/productos/services'

export type Billetera = Database['public']['Tables']['billeteras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type BilleteraUpdate = Database['public']['Tables']['billeteras']['Update']
export type Retiro = Database['public']['Tables']['retiros']['Row']
export type RetiroInsert = Database['public']['Tables']['retiros']['Insert']

// Tipo para crear retiro con campos adicionales
export type CreateRetiroData = {
  monto: number
  usuario_id: string
  estado: "aprobado" | "pendiente" | "rechazado"
  monto_soles?: number
  comision_admin?: number
}

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

// Crear retiro con comisión del administrador
export const createRetiro = async (retiroData: CreateRetiroData): Promise<Retiro | null> => {
  try {
    // 1. Obtener configuración para la comisión
    const configuracion = await getConfiguracionActual()
    if (!configuracion) {
      throw new Error('No se pudo obtener la configuración del sistema')
    }

    const comisionPorcentaje = configuracion.comision || 10

    // 2. Verificar saldo del usuario (solo para validación, no retirar aún)
    const billeteraUsuario = await getBilleteraByUsuarioId(retiroData.usuario_id)
    if (!billeteraUsuario) {
      throw new Error('No se encontró la billetera del usuario')
    }

    if (billeteraUsuario.saldo < retiroData.monto) {
      throw new Error('Saldo insuficiente para el retiro solicitado')
    }

    // 3. Calcular comisión (para mostrar información al usuario)
    const comisionAdmin = parseFloat((retiroData.monto * (comisionPorcentaje / 100)).toFixed(2))
    const montoNetoUsuario = parseFloat((retiroData.monto - comisionAdmin).toFixed(2))

    // 4. Crear el registro de retiro PENDIENTE sin mover fondos
    // Los fondos se mueven cuando el admin apruebe
    const { data, error } = await supabase
      .from('retiros')
      .insert({
        usuario_id: retiroData.usuario_id,
        monto: montoNetoUsuario, // El monto que efectivamente recibirá el usuario
        estado: 'pendiente' // Siempre pendiente hasta aprobación del admin
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating retiro:', error)
      throw new Error('Error al crear el registro de retiro')
    }

    return data
  } catch (error) {
    console.error('Error en createRetiro:', error)
    throw error
  }
}

// Nueva función para procesar el retiro cuando el admin lo apruebe
export const procesarRetiroAprobado = async (retiroId: string): Promise<boolean> => {
  try {
    // 1. Obtener el retiro
    const { data: retiro, error: retiroError } = await supabase
      .from('retiros')
      .select('*')
      .eq('id', retiroId)
      .single()

    if (retiroError || !retiro) {
      throw new Error('Retiro no encontrado')
    }

    // 2. Obtener configuración para recalcular comisión
    const configuracion = await getConfiguracionActual()
    if (!configuracion) {
      throw new Error('No se pudo obtener la configuración del sistema')
    }

    const comisionPorcentaje = configuracion.comision || 10

    // 3. Calcular monto total (incluyendo comisión)
    const montoNetoUsuario = retiro.monto
    const montoTotalConComision = parseFloat((montoNetoUsuario / (1 - comisionPorcentaje / 100)).toFixed(2))
    const comisionAdmin = parseFloat((montoTotalConComision - montoNetoUsuario).toFixed(2))

    // 4. Verificar saldo actual del usuario
    const billeteraUsuario = await getBilleteraByUsuarioId(retiro.usuario_id)
    if (!billeteraUsuario || billeteraUsuario.saldo < montoTotalConComision) {
      throw new Error('El usuario ya no tiene saldo suficiente para este retiro')
    }

    // 5. Realizar las transferencias de fondos
    const billeteraActualizada = await retirarFondos(retiro.usuario_id, montoTotalConComision)
    if (!billeteraActualizada) {
      throw new Error('Error al retirar fondos de la billetera')
    }

    // 6. Agregar la comisión al administrador
    const administrador = await getAdministrador()
    if (administrador) {
      const billeteraAdmin = await agregarFondos(administrador.id, comisionAdmin)
      if (!billeteraAdmin) {
        console.warn('No se pudo agregar la comisión al administrador')
        // Revertir el retiro si falla la comisión
        await agregarFondos(retiro.usuario_id, montoTotalConComision)
        throw new Error('Error al procesar la comisión del administrador')
      }
    }

    return true
  } catch (error) {
    console.error('Error procesando retiro aprobado:', error)
    throw error
  }
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

// Get historial de retiros
export const getHistorialRetiros = async (usuarioId: string) => {
  const { data, error } = await supabase
    .from('retiros')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching retiros:', error)
    return []
  }

  return data || []
}

// Get historial completo (recargas + retiros)
export const getHistorialCompleto = async (usuarioId: string) => {
  const [recargas, retiros] = await Promise.all([
    getHistorialTransacciones(usuarioId),
    getHistorialRetiros(usuarioId)
  ])

  // Combinar y marcar el tipo
  const recargasConTipo = recargas.map(r => ({ ...r, tipo: 'recarga' as const }))
  const retirosConTipo = retiros.map(r => ({ ...r, tipo: 'retiro' as const }))

  // Combinar y ordenar por fecha
  const historialCompleto = [...recargasConTipo, ...retirosConTipo]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return historialCompleto
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