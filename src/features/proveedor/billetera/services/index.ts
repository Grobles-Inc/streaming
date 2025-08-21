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

// Get historial de renovaciones de productos
export const getHistorialRenovaciones = async (proveedorId: string) => {
  try {
    // Obtener productos del proveedor que han sido actualizados (posibles renovaciones)
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select(`
        id,
        nombre,
        estado,
        fecha_expiracion,
        updated_at,
        created_at
      `)
      .eq('proveedor_id', proveedorId)
      .eq('estado', 'publicado')
      .not('fecha_expiracion', 'is', null)
      .order('updated_at', { ascending: false })

    if (productosError) {
      console.error('Error fetching productos para renovaciones:', productosError)
      return []
    }

    if (!productos || productos.length === 0) {
      return []
    }

    // Obtener configuraciones para calcular comisiones históricas
    const { data: configuraciones, error: configError } = await supabase
      .from('configuracion')
      .select('comision_publicacion_producto, updated_at')
      .order('updated_at', { ascending: false })

    if (configError) {
      console.error('Error fetching configuraciones para renovaciones:', configError)
      return []
    }

    // Filtrar productos que posiblemente han sido renovados
    // Un producto renovado tiene updated_at diferente a created_at y fecha_expiracion > created_at + 30 días
    const renovaciones = productos
      .filter(producto => {
        const fechaCreacion = new Date(producto.created_at)
        const fechaActualizacion = new Date(producto.updated_at)
        const fechaExpiracion = new Date(producto.fecha_expiracion)
        
        // Diferencia mayor a 1 minuto entre creación y actualización
        const diferenciaMinutos = (fechaActualizacion.getTime() - fechaCreacion.getTime()) / (1000 * 60)
        
        // La fecha de expiración es mayor a 30 días desde la creación (indica renovación)
        const diasDesdeCreacion = (fechaExpiracion.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24)
        
        return diferenciaMinutos > 1 && diasDesdeCreacion > 30
      })
      .map(producto => {
        // Encontrar la configuración vigente al momento de la renovación
        const fechaRenovacion = new Date(producto.updated_at)
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= fechaRenovacion
        ) || configuraciones?.[configuraciones.length - 1]

        const montoComision = configVigente?.comision_publicacion_producto || 1.35

        return {
          id: `renovacion_${producto.id}`,
          usuario_id: proveedorId,
          monto: montoComision,
          estado: 'completado',
          created_at: producto.updated_at,
          updated_at: producto.updated_at,
          tipo: 'renovacion' as const,
          // Información adicional del producto
          producto_publicado: {
            id: producto.id,
            nombre: producto.nombre
          }
        }
      })

    return renovaciones
  } catch (error) {
    console.error('Error fetching historial renovaciones:', error)
    return []
  }
}

// Get historial de renovaciones de pedidos hechas por vendedores
export const getHistorialRenovacionesPedidos = async (proveedorId: string) => {
  try {
    // Obtener pedidos del proveedor que han sido renovados por vendedores
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select(`
        id,
        precio,
        estado,
        created_at,
        updated_at,
        fecha_expiracion,
        productos:producto_id(nombre, precio_publico, tiempo_uso, precio_renovacion),
        usuarios:vendedor_id(nombres, apellidos, email, telefono)
      `)
      .eq('proveedor_id', proveedorId)
      .not('fecha_expiracion', 'is', null)
      .order('created_at', { ascending: false })

    if (comprasError) {
      console.error('Error fetching compras para renovaciones de pedidos:', comprasError)
      return []
    }

    if (!compras || compras.length === 0) {
      return []
    }

    // Filtrar solo las compras que fueron renovadas por vendedores
    const renovacionesPedidos = compras
      .filter(compra => {
        const fechaCreacion = compra.created_at
        const fechaExpiracion = compra.fecha_expiracion
        const producto = Array.isArray(compra.productos) ? compra.productos[0] : compra.productos
        const tiempoUso = producto?.tiempo_uso

        if (!fechaCreacion || !fechaExpiracion || !tiempoUso) {
          return false
        }

        // Calcular la fecha que debería tener originalmente
        const fechaOriginal = new Date(fechaCreacion)
        const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
        const fechaExpiracionActual = new Date(fechaExpiracion)

        // Si la fecha de expiración es MAYOR que la calculada originalmente, fue renovado por vendedor
        return fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
      })
      .map(compra => {
        const producto = Array.isArray(compra.productos) ? compra.productos[0] : compra.productos
        const usuario = Array.isArray(compra.usuarios) ? compra.usuarios[0] : compra.usuarios
        const precioRenovacion = producto?.precio_renovacion || 0

        // La fecha de renovación es cuando se actualizó la compra (cuando el vendedor renovó)
        // Si no hay updated_at disponible, usar created_at como fallback
        const fechaRenovacion = compra.updated_at || compra.created_at

        return {
          id: `renovacion_pedido_${compra.id}`,
          usuario_id: proveedorId,
          vendedor_id: usuario?.nombres || null,
          monto: precioRenovacion,
          estado: 'completado',
          created_at: fechaRenovacion, // Usar fecha calculada de renovación
          updated_at: fechaRenovacion,
          tipo: 'renovacion_pedido' as const,
          // Información adicional del producto y vendedor
          productos: producto ? {
            nombre: producto.nombre,
            precio_publico: producto.precio_publico
          } : undefined,
          usuarios: usuario ? {
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            telefono: usuario.telefono
          } : null
        }
      })

    return renovacionesPedidos
  } catch (error) {
    console.error('Error fetching historial renovaciones pedidos:', error)
    return []
  }
}

// Get historial de reembolsos procesados por el proveedor
export const getHistorialReembolsos = async (proveedorId: string) => {
  try {
    // Obtener compras reembolsadas donde el proveedor tuvo que pagar el reembolso
    const { data: comprasReembolsadas, error: comprasError } = await supabase
      .from('compras')
      .select(`
        id,
        monto_reembolso,
        estado,
        updated_at,
        created_at,
        productos:producto_id(nombre, precio_publico),
        usuarios:vendedor_id(nombres, apellidos, email, telefono)
      `)
      .eq('proveedor_id', proveedorId)
      .eq('estado', 'reembolsado')
      .gt('monto_reembolso', 0)
      .order('updated_at', { ascending: false })

    if (comprasError) {
      console.error('Error fetching compras reembolsadas:', comprasError)
      return []
    }

    if (!comprasReembolsadas || comprasReembolsadas.length === 0) {
      return []
    }

    // Mapear compras reembolsadas a transacciones de reembolso
    const reembolsos = comprasReembolsadas.map(compra => {
      const producto = Array.isArray(compra.productos) ? compra.productos[0] : compra.productos
      const usuario = Array.isArray(compra.usuarios) ? compra.usuarios[0] : compra.usuarios
      
      return {
        id: `reembolso_${compra.id}`,
        usuario_id: proveedorId,
        monto: compra.monto_reembolso,
        estado: 'completado',
        created_at: compra.updated_at, // Usar updated_at como fecha del reembolso
        updated_at: compra.updated_at,
        tipo: 'reembolso' as const,
        // Información adicional del producto y vendedor
        productos: producto ? {
          nombre: producto.nombre,
          precio_publico: producto.precio_publico
        } : undefined,
        usuarios: usuario ? {
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          telefono: usuario.telefono
        } : null
      }
    })

    return reembolsos
  } catch (error) {
    console.error('Error fetching historial reembolsos:', error)
    return []
  }
}

// Get historial completo (recargas + retiros + compras del proveedor + renovaciones + renovaciones pedidos + reembolsos)
export const getHistorialCompleto = async (usuarioId: string) => {
  const [recargas, retiros, compras, gastosPublicacion, renovaciones, renovacionesPedidos, reembolsos] = await Promise.all([
    getHistorialTransacciones(usuarioId),
    getHistorialRetiros(usuarioId),
    getHistorialCompras(usuarioId),
    getHistorialGastosPublicacion(usuarioId),
    getHistorialRenovaciones(usuarioId),
    getHistorialRenovacionesPedidos(usuarioId),
    getHistorialReembolsos(usuarioId)
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
  const renovacionesConTipo = renovaciones
  const renovacionesPedidosConTipo = renovacionesPedidos
  const reembolsosConTipo = reembolsos

  // Combinar y ordenar por fecha
  const historialCompleto = [
    ...recargasConTipo, 
    ...retirosConTipo, 
    ...comprasConTipo,
    ...gastosPublicacionConTipo,
    ...renovacionesConTipo,
    ...renovacionesPedidosConTipo,
    ...reembolsosConTipo
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