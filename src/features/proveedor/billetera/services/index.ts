import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { getConfiguracionActual } from '@/features/proveedor/productos/services'

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

// Función simplificada - el trigger se encarga del procesamiento de fondos
export const procesarRetiroAprobado = async (retiroId: number): Promise<boolean> => {
  try {
    // Solo verificamos que el retiro existe
    // El trigger se encargará de manejar los fondos y comisiones automáticamente
    const { data: retiro, error: retiroError } = await supabase
      .from('retiros')
      .select('*')
      .eq('id', retiroId)
      .single()

    if (retiroError || !retiro) {
      throw new Error('Retiro no encontrado')
    }

    console.log('Retiro procesado correctamente por el trigger')
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

// Get historial de compras/pedidos del proveedor
export const getHistorialCompras = async (proveedorId: string) => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id(nombre, precio_publico),
      usuarios:vendedor_id(nombres, apellidos, email, telefono)
    `)
    .eq('proveedor_id', proveedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching compras:', error)
    return []
  }

  return data || []
}

// Get historial de gastos por publicación de productos
export const getHistorialGastosPublicacion = async (proveedorId: string) => {
  try {
    // 1. Obtener todos los productos publicados del proveedor
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        estado,
        updated_at,
        created_at
      `)
      .eq('proveedor_id', proveedorId)
      .eq('estado', 'publicado')
      .order('updated_at', { ascending: false })

    if (productosError) {
      console.error('Error fetching productos publicados:', productosError)
      return []
    }

    if (!productos || productos.length === 0) {
      return []
    }

    // 2. Obtener configuraciones para calcular comisiones históricas
    const { data: configuraciones, error: configError } = await supabase
      .from('configuracion')
      .select('comision_publicacion_producto, updated_at')
      .order('updated_at', { ascending: false })

    if (configError) {
      console.error('Error fetching configuraciones:', configError)
      return []
    }

    // 3. Mapear productos a gastos de publicación
    const gastosPublicacion = productos.map(producto => {
      // Encontrar la configuración vigente al momento de la publicación
      const fechaPublicacion = new Date(producto.updated_at)
      const configVigente = configuraciones?.find(config => 
        new Date(config.updated_at) <= fechaPublicacion
      ) || configuraciones?.[configuraciones.length - 1]

      const montoComision = configVigente?.comision_publicacion_producto || 1.35

      return {
        id: `gasto_pub_${producto.id}`,
        usuario_id: proveedorId,
        monto: montoComision,
        estado: 'completado',
        created_at: producto.updated_at,
        updated_at: producto.updated_at,
        tipo: 'gasto_publicacion' as const,
        // Información adicional del producto
        producto_publicado: {
          id: producto.id,
          nombre: producto.nombre
        }
      }
    })

    return gastosPublicacion
  } catch (error) {
    console.error('Error fetching gastos publicación:', error)
    return []
  }
}

// Get historial completo (recargas + retiros + compras del proveedor)
export const getHistorialCompleto = async (usuarioId: string) => {
  const [recargas, retiros, compras, gastosPublicacion] = await Promise.all([
    getHistorialTransacciones(usuarioId),
    getHistorialRetiros(usuarioId),
    getHistorialCompras(usuarioId),
    getHistorialGastosPublicacion(usuarioId)
  ])

  // Combinar y marcar el tipo
  const recargasConTipo = recargas.map(r => ({ ...r, tipo: 'recarga' as const }))
  const retirosConTipo = retiros.map(r => ({ ...r, tipo: 'retiro' as const }))
  const comprasConTipo = compras.map(c => ({ 
    ...c, 
    tipo: 'compra' as const,
    monto: c.precio,
    estado: c.estado || 'completado'
  }))

  const gastosPublicacionConTipo = gastosPublicacion

  // Combinar y ordenar por fecha
  const historialCompleto = [
    ...recargasConTipo, 
    ...retirosConTipo, 
    ...comprasConTipo,
    ...gastosPublicacionConTipo
  ]
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