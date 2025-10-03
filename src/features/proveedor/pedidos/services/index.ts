import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import {  UpdateSoporteStatusParams } from '../data/types'

// Importar la función para actualizar el array stock_de_productos
import { updateStockDeProductos } from '../../productos'

export type Compra = Database['public']['Tables']['compras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']
export type StockProducto = Database['public']['Tables']['stock_productos']['Row']
export type SupabasePedido = Database['public']['Tables']['compras']['Row']
export type PedidoUpdate = Database['public']['Tables']['compras']['Update']

// Get compras by proveedor ID (pedidos/ventas del proveedor)
export const getComprasByProveedorId = async (proveedorId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, tiempo_uso, precio_renovacion),
      usuarios:vendedor_id (nombres, apellidos, telefono),
      stock_productos:stock_producto_id (id, email, clave, pin, perfil, url, soporte_stock_producto)
    `)
    .eq('proveedor_id', proveedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching compras by proveedor:', error)
    return []
  }

  return data || []
}

// Get compra by ID (para proveedor)
export const getCompraById = async (id: string): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, precio_renovacion)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching compra:', error)
    return null
  }

  return data
}

// Update compra status (para proveedor confirmar/rechazar pedidos)
export const updateCompraStatus = async (id: string, updates: CompraUpdate): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating compra:', error)
    return null
  }

  return data
}

// Get latest compras/pedidos for proveedor
export const getLatestComprasByProveedor = async (proveedorId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, precio_renovacion)
    `)
    .eq('proveedor_id', proveedorId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching latest compras:', error)
    return []
  }

  return data || []
}

// Get compras with pagination (for proveedor dashboard)
export const getComprasPaginatedByProveedor = async (
  proveedorId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Compra[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, precio_renovacion)
    `, { count: 'exact' })
    .eq('proveedor_id', proveedorId)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated compras:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

// Get compras stats for proveedor dashboard
export const getComprasStatsByProveedor = async (proveedorId: string) => {
  const { data, error } = await supabase
    .from('compras')
    .select('estado, precio')
    .eq('proveedor_id', proveedorId)

  if (error) {
    console.error('Error fetching compras stats:', error)
    return {
      total: 0,
      completadas: 0,
      pendientes: 0,
      ingresos: 0
    }
  }

  const stats = {
    total: data.length,
    completadas: data.filter(c => c.estado === 'completado').length,
    pendientes: data.filter(c => c.estado === 'pendiente').length,
    ingresos: data
      .filter(c => c.estado === 'completado')
      .reduce((sum, c) => sum + c.precio, 0)
  }

  return stats
}

// Update stock producto soporte status
export const updateStockProductoSoporteStatus = async (params: UpdateSoporteStatusParams): Promise<StockProducto | null> => {
  const { stockProductoId, estado, respuesta } = params
  
  // Preparar los datos de actualización
  const updateData: Database['public']['Tables']['stock_productos']['Update'] = {
    soporte_stock_producto: estado
  }

  // Si se proporciona una respuesta, también actualizar la compra correspondiente
  if (respuesta) {
    // Primero obtener la compra relacionada
    const { data: stockProducto } = await supabase
      .from('stock_productos')
      .select('id')
      .eq('id', stockProductoId)
      .single()

    if (stockProducto) {
      // Actualizar la respuesta de soporte en la compra
      await supabase
        .from('compras')
        .update({ soporte_respuesta: respuesta })
        .eq('stock_producto_id', stockProductoId)
    }
  }

  // Actualizar el estado de soporte del stock
  const { data, error } = await supabase
    .from('stock_productos')
    .update(updateData)
    .eq('id', stockProductoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating stock producto soporte status:', error)
    throw error
  }

  return data
}

// Update stock producto account data (email, clave, pin, perfil, url)
export const updateStockProductoAccountData = async (
  stockProductoId: number,
  accountData: {
    email?: string | null
    clave?: string | null
    pin?: string | null
    perfil?: string | null
    url?: string | null
  }
): Promise<StockProducto | null> => {
  const updateData: Database['public']['Tables']['stock_productos']['Update'] = {}

  // Solo incluir campos que fueron proporcionados
  if (accountData.email !== undefined) updateData.email = accountData.email
  if (accountData.clave !== undefined) updateData.clave = accountData.clave
  if (accountData.pin !== undefined) updateData.pin = accountData.pin
  if (accountData.perfil !== undefined) updateData.perfil = accountData.perfil
  if (accountData.url !== undefined) updateData.url = accountData.url

  const { data, error } = await supabase
    .from('stock_productos')
    .update(updateData)
    .eq('id', stockProductoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating stock producto account data:', error)
    throw error
  }

  return data
}

// Update producto precio renovacion
export const updateProductoPrecioRenovacion = async (
  productoId: number,
  precioRenovacion: number
): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .update({ precio_renovacion: precioRenovacion })
    .eq('id', productoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating producto precio renovacion:', error)
    throw error
  }

  return data
}

// Update pedido fechas
export const updatePedidoFechas = async (
  pedidoId: number,
  fechaInicio: string | null,
  fechaExpiracion: string | null
): Promise<Compra | null> => {
  const updateData: Database['public']['Tables']['compras']['Update'] = {}

  if (fechaInicio) updateData.fecha_inicio = fechaInicio
  if (fechaExpiracion) updateData.fecha_expiracion = fechaExpiracion

  const { data, error } = await supabase
    .from('compras')
    .update(updateData)
    .eq('id', pedidoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating pedido fechas:', error)
    throw error
  }

  return data
}

// Update producto tiempo uso
export const updateProductoTiempoUso = async (
  productoId: number,
  tiempoUso: number
): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .update({ tiempo_uso: tiempoUso })
    .eq('id', productoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating producto tiempo uso:', error)
    throw error
  }

  return data
}

// Nuevo servicio para procesar reembolso
export const procesarReembolsoProveedor = async (
  compraId: string,
  proveedorId: string,
  vendedorId: string,
  montoReembolso: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Procesando reembolso del proveedor:', {
      compraId,
      proveedorId,
      vendedorId,
      montoReembolso
    })

    // 0. Obtener información de la compra para el stock_producto_id
    const { data: compra, error: errorCompra } = await supabase
      .from('compras')
      .select('stock_producto_id, producto_id')
      .eq('id', compraId)
      .single()

    if (errorCompra || !compra) {
      return { success: false, error: 'No se encontró la compra' }
    }

    // 1. Obtener billeteras
    const { data: billeteraProveedor, error: errorBilleteraProveedor } = await supabase
      .from('billeteras')
      .select('*')
      .eq('usuario_id', proveedorId)
      .single()

    if (errorBilleteraProveedor || !billeteraProveedor) {
      return { success: false, error: 'No se encontró la billetera del proveedor' }
    }

    const { data: billeteraVendedor, error: errorBilleteraVendedor } = await supabase
      .from('billeteras')
      .select('*')
      .eq('usuario_id', vendedorId)
      .single()

    if (errorBilleteraVendedor || !billeteraVendedor) {
      return { success: false, error: 'No se encontró la billetera del vendedor' }
    }

    // 2. Verificar que el proveedor tenga saldo suficiente
    if (billeteraProveedor.saldo < montoReembolso) {
      return { 
        success: false, 
        error: `Saldo insuficiente. Tienes $${billeteraProveedor.saldo.toFixed(2)} pero necesitas $${montoReembolso.toFixed(2)}` 
      }
    }

    // 3. Realizar transferencia de fondos
    const nuevoSaldoProveedor = billeteraProveedor.saldo - montoReembolso
    const nuevoSaldoVendedor = billeteraVendedor.saldo + montoReembolso

    // Actualizar billetera del proveedor
    const { error: errorProveedor } = await supabase
      .from('billeteras')
      .update({ 
        saldo: nuevoSaldoProveedor, 
        updated_at: new Date().toISOString() 
      })
      .eq('usuario_id', proveedorId)

    if (errorProveedor) {
      console.error('Error actualizando billetera del proveedor:', errorProveedor)
      return { success: false, error: 'Error al descontar fondos del proveedor' }
    }

    // Actualizar billetera del vendedor
    const { error: errorVendedor } = await supabase
      .from('billeteras')
      .update({ 
        saldo: nuevoSaldoVendedor, 
        updated_at: new Date().toISOString() 
      })
      .eq('usuario_id', vendedorId)

    if (errorVendedor) {
      console.error('Error actualizando billetera del vendedor:', errorVendedor)
      // Revertir cambio en billetera del proveedor
      await supabase
        .from('billeteras')
        .update({ 
          saldo: billeteraProveedor.saldo, 
          updated_at: new Date().toISOString() 
        })
        .eq('usuario_id', proveedorId)
      
      return { success: false, error: 'Error al transferir fondos al vendedor' }
    }

    // 4. 🆕 DEVOLVER EL STOCK: Cambiar estado del stock_producto de "vendido" a "disponible"
    if (compra.stock_producto_id) {
      const { error: errorStock } = await supabase
        .from('stock_productos')
        .update({ 
          estado: 'disponible',
          soporte_stock_producto: 'activo'
        })
        .eq('id', compra.stock_producto_id)

      if (errorStock) {
        console.error('Error actualizando estado del stock:', errorStock)
        // Revertir transferencias de billeteras si falla la actualización del stock
        await supabase
          .from('billeteras')
          .update({ saldo: billeteraProveedor.saldo })
          .eq('usuario_id', proveedorId)
        
        await supabase
          .from('billeteras')
          .update({ saldo: billeteraVendedor.saldo })
          .eq('usuario_id', vendedorId)
        
        return { success: false, error: 'Error al devolver el stock a disponible' }
      }

      // 5. 🆕 ACTUALIZAR ARRAY: Sincronizar el array stock_de_productos
      try {
        await updateStockDeProductos(compra.producto_id)
        console.log('✅ Stock devuelto al array stock_de_productos del producto:', compra.producto_id)
      } catch (stockError) {
        console.error('Error actualizando stock_de_productos:', stockError)
        // Nota: No revertimos todo por este error, pero lo registramos
        console.warn('⚠️ Reembolso procesado pero stock_de_productos no se pudo actualizar. Puede sincronizarse manualmente.')
      }
    }

    // 6. Actualizar el estado de la compra a "reembolsado"
    const { error: errorCompraUpdate } = await supabase
      .from('compras')
      .update({
        estado: 'reembolsado',
        updated_at: new Date().toISOString()
      })
      .eq('id', compraId)

    if (errorCompraUpdate) {
      console.error('Error actualizando estado de compra:', errorCompraUpdate)
      // Revertir todo si falla la actualización de la compra
      await supabase
        .from('billeteras')
        .update({ saldo: billeteraProveedor.saldo })
        .eq('usuario_id', proveedorId)
      
      await supabase
        .from('billeteras')
        .update({ saldo: billeteraVendedor.saldo })
        .eq('usuario_id', vendedorId)

      // Revertir estado del stock si existe
      if (compra.stock_producto_id) {
        await supabase
          .from('stock_productos')
          .update({ 
            estado: 'vendido',
            soporte_stock_producto: 'soporte'
          })
          .eq('id', compra.stock_producto_id)
      }
      
      return { success: false, error: 'Error al actualizar el estado de la compra' }
    }

    console.log('✅ Reembolso procesado exitosamente:', {
      proveedorAntes: billeteraProveedor.saldo,
      proveedorDespues: nuevoSaldoProveedor,
      vendedorAntes: billeteraVendedor.saldo,
      vendedorDespues: nuevoSaldoVendedor,
      stockDevuelto: compra.stock_producto_id ? 'Sí' : 'No'
    })

    return { success: true }

  } catch (error) {
    console.error('❌ Error al procesar reembolso:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
} 

// Eliminar pedido expirado y cuenta asociada
export const eliminarPedidoExpirado = async (
  compraId: number,
  stockProductoId?: number | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    // ORDEN CORRECTO: Primero eliminar compra (que referencia stock_producto), después stock_producto
    
    // 1. Eliminar el registro del pedido (compra) PRIMERO
    const { data: compraData, error: compraError } = await supabase
      .from('compras')
      .delete()
      .eq('id', compraId)
      .select()

    if (compraError) {
      console.error('Error eliminando compra:', compraError)
      return { success: false, error: `Error al eliminar el pedido: ${compraError.message}` }
    }

    if (!compraData || compraData.length === 0) {
      return { success: false, error: 'No se encontró el pedido para eliminar' }
    }

    // 2. Eliminar el registro del stock_producto DESPUÉS (ahora que no hay referencias)
    if (stockProductoId) {
      const { data: _stockData, error: stockError } = await supabase
        .from('stock_productos')
        .delete()
        .eq('id', stockProductoId)
        .select()

      if (stockError) {
        console.error('Error eliminando stock_producto:', stockError)
        return { success: false, error: `Error al eliminar la cuenta del stock: ${stockError.message}` }
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Error al eliminar pedido expirado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export const eliminarPedidosExpiradosEnBloque = async (
  ids: number[]
): Promise<{ success: boolean; error?: string }> => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: 'No se proporcionaron IDs para eliminar' }
  }
  try {
    const { error } = await supabase
      .from('compras')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error al eliminar pedidos expirados:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error al eliminar pedidos expirados:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Completar soporte - solo actualiza el estado del stock y respuesta
export const completarSoporte = async (
  compraId: string,
  stockProductoId: number,
  respuesta?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Actualizar el estado del stock producto a 'activo'
    const { error: errorStock } = await supabase
      .from('stock_productos')
      .update({ soporte_stock_producto: 'activo' })
      .eq('id', stockProductoId)

    if (errorStock) {
      console.error('Error updating stock producto status:', errorStock)
      return { success: false, error: 'Error al actualizar el estado del stock' }
    }

    // 2. Actualizar la respuesta de soporte si se proporciona
    if (respuesta) {
      const { error: errorCompra } = await supabase
        .from('compras')
        .update({ soporte_respuesta: respuesta })
        .eq('id', compraId)

      if (errorCompra) {
        console.error('Error updating compra response:', errorCompra)
        return { success: false, error: 'Error al actualizar la respuesta de soporte' }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error completando soporte:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Actualizar pedido expirado a estado "vencido"
export const updatePedidoStatusVencido = async (pedidoId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Actualizando pedido expirado a vencido:', pedidoId)

    const { data, error } = await supabase
      .from('compras')
      .update({ 
        estado: 'vencido',
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) {
      console.error('Error al actualizar pedido a vencido:', error)
      return { success: false, error: error.message }
    }

    console.log('Pedido actualizado a vencido exitosamente:', data)
    return { success: true }

  } catch (error) {
    console.error('Error al actualizar pedido a vencido:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Corregir pedido marcado incorrectamente como "vencido" cuando aún le quedan días
export const corregirPedidoVencidoIncorrecto = async (pedidoId: number, estadoOriginal: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Corrigiendo pedido marcado incorrectamente como vencido (${pedidoId}) a estado original: ${estadoOriginal}`)

    const { data, error } = await supabase
      .from('compras')
      .update({ 
        estado: estadoOriginal as Database['public']['Tables']['compras']['Row']['estado'], // Restaurar al estado original
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) {
      console.error('Error al corregir pedido vencido incorrectamente:', error)
      return { success: false, error: error.message }
    }

    console.log('Pedido corregido exitosamente:', data)
    return { success: true }

  } catch (error) {
    console.error('Error al corregir pedido vencido incorrectamente:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
} 
