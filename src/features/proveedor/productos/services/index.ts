import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Producto = Database['public']['Tables']['productos']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Categoria = Database['public']['Tables']['categorias']['Row']
export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']
export type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']
export type Billetera = Database['public']['Tables']['billeteras']['Row']


// Create a new producto
export const createProducto = async (producto: ProductoInsert): Promise<Producto> => {
  const { data, error } = await supabase
    .from('productos')
    .insert(producto)
    .select()
    .single()

  if (error) {
    throw new Error(`Error al crear producto: ${error.message}`)
  }
  return data

}

// Create producto with comision
export const createProductoWithCommission = async (
  { producto, proveedorId }: { producto: Omit<Database['public']['Tables']['productos']['Insert'], 'id' | 'created_at' | 'updated_at'>, proveedorId: string }
): Promise<Producto> => {
  console.log('🔄 Iniciando creación de producto con comisión...')
  
  try {
    // 1. Verificar saldo suficiente
    const saldoInfo = await verificarSaldoSuficiente(proveedorId)
    if (!saldoInfo.suficiente) {
      const comisionFormateada = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(saldoInfo.comisionRequerida)
      
      throw new Error(`Saldo insuficiente. Necesitas ${comisionFormateada} para publicar un producto`)
    }

    // 2. Crear el producto
    const { data: nuevoProducto, error: errorProducto } = await supabase
      .from('productos')
      .insert([producto])
      .select(`
        *,
        categorias:categoria_id(nombre, descripcion),
        usuarios:proveedor_id(nombres, apellidos)
      `)
      .single()

    if (errorProducto) {
      console.error('❌ Error al crear producto:', errorProducto)
      throw new Error('Error al crear el producto')
    }

    console.log('✅ Producto creado:', nuevoProducto.id)

    // 3. Procesar comisión de publicación
    await procesarComisionPublicacion(proveedorId)

    console.log('✅ Comisión procesada correctamente')

    // 4. Retornar el producto creado
    return nuevoProducto as Producto
  } catch (error) {
    console.error('❌ Error en createProductoWithCommission:', error)
    throw error
  }
}

// Get productos by proveedor ID
export const getProductosByProveedorId = async (proveedorId: string): Promise<(Producto & { categorias?: Categoria })[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      )
    `)
    .eq('proveedor_id', proveedorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos by proveedor:', error)
    return []
  }

  return data || []
}

// Get producto by ID
export const getProductoById = async (id: string): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }

  return data
}

// Update producto
export const updateProducto = async (id: string, updates: ProductoUpdate): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      )
    `)
    .single()

  if (error) {
    console.error('Error updating producto:', error)
    return null
  }

  return data
}

// Verificar si un producto tiene cuentas de stock asociadas
export const verificarProductoTieneCuentas = async (productoId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select('id')
    .eq('producto_id', productoId)
    .limit(1)

  if (error) {
    console.error('Error checking stock productos:', error)
    return false
  }

  return (data && data.length > 0) || false
}

// Delete producto
export const deleteProducto = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting producto:', error)
    
    // Verificar si es un error de foreign key constraint (producto tiene cuentas asociadas)
    if (error.code === '23503' && error.details?.includes('stock_productos')) {
      throw new Error('No se puede eliminar este producto porque tiene cuentas de stock asociadas. Para eliminarlo, primero debes eliminar todas las cuentas de este producto.')
    }
    
    // Otros errores de constraint
    if (error.code === '23503') {
      throw new Error('No se puede eliminar este producto porque tiene datos asociados. Verifica que no tenga ventas o referencias pendientes.')
    }
    
    // Error genérico
    throw new Error('Error al eliminar el producto. Intenta nuevamente.')
  }

  return true
}

// Función para sincronizar todos los productos de un proveedor (útil para migración)
export const sincronizarStockDeProductos = async (proveedorId: string) => {
  try {
    console.log('🔄 Iniciando sincronización de stock para proveedor:', proveedorId)
    
    // Obtener todos los productos del proveedor
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id')
      .eq('proveedor_id', proveedorId)

    if (productosError) {
      console.error('Error fetching productos:', productosError)
      return { success: false, error: productosError.message }
    }

    // Sincronizar cada producto
    let sincronizados = 0
    for (const producto of productos || []) {
      await updateStockDeProductos(producto.id)
      sincronizados++
    }

    console.log(`✅ Sincronización completada: ${sincronizados} productos actualizados`)
    return { success: true, sincronizados }
  } catch (error) {
    console.error('Error en sincronizarStockDeProductos:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Get productos with pagination (for proveedor)
export const getProductosPaginated = async (
  proveedorId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Producto[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('productos')
    .select(`
      *,
      categorias (
        id,
        nombre,
        descripcion,
        imagen_url
      )
    `, { count: 'exact' })
    .eq('proveedor_id', proveedorId)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated productos:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

// Get all categorias for dropdowns
export const getCategorias = async (): Promise<Categoria[]> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

  if (error) {
    console.error('Error fetching categorias:', error)
    return []
  }

  return data || []
}

// Get productos stats for proveedor dashboard
export const getProductosStatsByProveedor = async (proveedorId: string) => {
  const { data, error } = await supabase
    .from('productos')
    .select('disponibilidad, destacado, mas_vendido')
    .eq('proveedor_id', proveedorId)

  if (error) {
    console.error('Error fetching productos stats:', error)
    return {
      total: 0,
      enStock: 0,
      destacados: 0,
      masVendidos: 0,
      stockTotal: 0
    }
  }

  // Obtener el total de stock real desde stock_productos
  const { data: stockData, error: stockError } = await supabase
    .from('stock_productos')
    .select('id')
    .eq('proveedor_id', proveedorId)
    .eq('estado', 'disponible')

  const stockTotal = stockError ? 0 : (stockData?.length || 0)

  const stats = {
    total: data.length,
    enStock: data.filter(p => p.disponibilidad === 'en_stock').length,
    destacados: data.filter(p => p.destacado).length,
    masVendidos: data.filter(p => p.mas_vendido).length,
    stockTotal
  }

  return stats
} 

// funciones de comision
export const getConfiguracionActual = async (): Promise<ConfiguracionRow | null> => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error obteniendo configuración:', error)
    return null
  }

  return data
}

/**
 * Obtiene el primer usuario administrador del sistema
 */
export const getAdministrador = async (): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('rol', 'admin')
    .limit(1)
    .single()

  if (error) {
    console.error('Error obteniendo administrador:', error)
    return null
  }

  return data
}

/**
 * Obtiene la billetera de un usuario
 */
export const getBilleteraByUsuarioId = async (usuarioId: string): Promise<Billetera | null> => {
  const { data, error } = await supabase
    .from('billeteras')
    .select('*')
    .eq('usuario_id', usuarioId)
    .single()

  if (error) {
    console.error('Error obteniendo billetera:', error)
    return null
  }

  return data
}

/**
 * Transfiere fondos de una billetera a otra usando función RPC
 */
export const transferirFondos = async (
  origenUsuarioId: string,
  destinoUsuarioId: string,
  monto: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar billeteras primero
    const billeteraOrigen = await getBilleteraByUsuarioId(origenUsuarioId)
    const billeteraDestino = await getBilleteraByUsuarioId(destinoUsuarioId)

    if (!billeteraOrigen || !billeteraDestino) {
      return { success: false, error: 'No se encontraron las billeteras' }
    }

    if (billeteraOrigen.saldo < monto) {
      return { success: false, error: 'Saldo insuficiente' }
    }

    // Realizar transferencia directa (sin RPC por simplicidad)
    const { error: errorOrigen } = await supabase
      .from('billeteras')
      .update({ 
        saldo: billeteraOrigen.saldo - monto, 
        updated_at: new Date().toISOString() 
      })
      .eq('usuario_id', origenUsuarioId)

    if (errorOrigen) {
      console.error('Error actualizando billetera origen:', errorOrigen)
      return { success: false, error: 'Error al descontar fondos' }
    }

    const { error: errorDestino } = await supabase
      .from('billeteras')
      .update({ 
        saldo: billeteraDestino.saldo + monto, 
        updated_at: new Date().toISOString() 
      })
      .eq('usuario_id', destinoUsuarioId)

    if (errorDestino) {
      console.error('Error actualizando billetera destino:', errorDestino)
      // Revertir cambio en billetera origen
      await supabase
        .from('billeteras')
        .update({ 
          saldo: billeteraOrigen.saldo, 
          updated_at: new Date().toISOString() 
        })
        .eq('usuario_id', origenUsuarioId)
      
      return { success: false, error: 'Error al transferir fondos' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error en transferirFondos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Procesa la comisión por publicación de producto
 */
export const procesarComisionPublicacion = async (
  proveedorId: string
): Promise<{ success: boolean; error?: string; comisionCobrada?: number }> => {
  try {
    // 1. Obtener configuración actual
    const configuracion = await getConfiguracionActual()
    if (!configuracion) {
      return { success: false, error: 'No se pudo obtener la configuración del sistema' }
    }

    const comisionMonto = configuracion.comision_publicacion_producto || 1.35

    // 2. Obtener administrador
    const administrador = await getAdministrador()
    if (!administrador) {
      return { success: false, error: 'No se encontró un administrador en el sistema' }
    }

    // 3. Verificar saldo del proveedor
    const billeteraProveedor = await getBilleteraByUsuarioId(proveedorId)
    if (!billeteraProveedor) {
      return { success: false, error: 'No se encontró la billetera del proveedor' }
    }

    if (billeteraProveedor.saldo < comisionMonto) {
      const comisionFormateada = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(comisionMonto)
      
      return { 
        success: false, 
        error: `Saldo insuficiente. Necesitas al menos ${comisionFormateada} para publicar un producto` 
      }
    }

    // 4. Realizar transferencia
    const resultadoTransferencia = await transferirFondos(
      proveedorId,
      administrador.id,
      comisionMonto
    )

    if (!resultadoTransferencia.success) {
      return { 
        success: false, 
        error: resultadoTransferencia.error || 'Error en la transferencia de fondos' 
      }
    }

    return { 
      success: true, 
      comisionCobrada: comisionMonto 
    }

  } catch (error) {
    console.error('Error procesando comisión de publicación:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al procesar comisión' 
    }
  }
}

/**
 * Verifica si el proveedor tiene saldo suficiente para publicar
 */
export const verificarSaldoSuficiente = async (
  proveedorId: string
): Promise<{ suficiente: boolean; saldoActual: number; comisionRequerida: number }> => {
  try {
    const configuracion = await getConfiguracionActual()
    const comisionRequerida = configuracion?.comision_publicacion_producto || 1.35
    
    const billetera = await getBilleteraByUsuarioId(proveedorId)
    const saldoActual = billetera?.saldo || 0
    
    return {
      suficiente: saldoActual >= comisionRequerida,
      saldoActual,
      comisionRequerida
    }
  } catch (error) {
    console.error('Error verificando saldo:', error)
    return {
      suficiente: false,
      saldoActual: 0,
      comisionRequerida: 1.35
    }
  }
}

// Nueva función para publicar productos existentes cobrando comisión
export const publicarProductoWithCommission = async (
  { productoId, proveedorId }: { productoId: string, proveedorId: string }
): Promise<Producto> => {
  console.log('🔄 Iniciando publicación de producto con comisión...', { productoId, proveedorId })
  
  try {
    // 1. Verificar que el producto existe y está en borrador
    const { data: producto, error: errorProducto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productoId)
      .eq('proveedor_id', proveedorId)
      .eq('estado', 'borrador')
      .single()

    if (errorProducto || !producto) {
      console.error('❌ Error al obtener producto:', errorProducto)
      throw new Error('Producto no encontrado o ya está publicado')
    }

    // 2. Verificar saldo suficiente
    const saldoInfo = await verificarSaldoSuficiente(proveedorId)
    if (!saldoInfo.suficiente) {
      const comisionFormateada = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(saldoInfo.comisionRequerida)
      
      throw new Error(`Saldo insuficiente. Necesitas ${comisionFormateada} para publicar este producto`)
    }

    // 3. Procesar comisión de publicación
    await procesarComisionPublicacion(proveedorId)

    console.log('✅ Comisión procesada correctamente')

    // 4. Actualizar estado del producto a publicado
    const { data: productoPublicado, error: errorActualizacion } = await supabase
      .from('productos')
      .update({ estado: 'publicado', updated_at: new Date().toISOString() })
      .eq('id', productoId)
      .select(`
        *,
        categorias:categoria_id(nombre, descripcion),
        usuarios:proveedor_id(nombres, apellidos)
      `)
      .single()

    if (errorActualizacion) {
      console.error('❌ Error al actualizar producto:', errorActualizacion)
      throw new Error('Error al publicar el producto')
    }

    console.log('✅ Producto publicado correctamente:', productoPublicado.id)

    // 5. Retornar el producto publicado
    return productoPublicado as Producto
  } catch (error) {
    console.error('❌ Error en publicarProductoWithCommission:', error)
    throw error
  }
}

// === FUNCIONES PARA GESTIÓN DE STOCK ===

// Función auxiliar para actualizar stock_de_productos en la tabla productos
export const updateStockDeProductos = async (productoId: string) => {
  try {
    // Obtener todos los IDs de stock_productos para este producto
    const { data: stockItems, error: stockError } = await supabase
      .from('stock_productos')
      .select('id')
      .eq('producto_id', productoId)
      .eq('estado', 'disponible')

    if (stockError) {
      console.error('Error fetching stock items:', stockError)
      return
    }

    // Formatear los IDs en el formato esperado por stock_de_productos
    const stockDeProductos = stockItems?.map(item => ({ id: item.id })) || []

    // Actualizar el campo stock_de_productos en la tabla productos
    const { error: updateError } = await supabase
      .from('productos')
      .update({ stock_de_productos: stockDeProductos })
      .eq('id', productoId)

    if (updateError) {
      console.error('Error updating stock_de_productos:', updateError)
    } else {
      console.log(`✅ stock_de_productos actualizado para producto ${productoId}:`, stockDeProductos.length, 'items')
    }
  } catch (error) {
    console.error('Error in updateStockDeProductos:', error)
  }
}

// Get stock productos by producto ID
export const getStockProductosByProductoId = async (productoId: string) => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select('*')
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching stock productos:', error)
    throw new Error(`Error al obtener el stock: ${error.message}`)
  }

  return data || []
}

// Create stock producto
export const createStockProducto = async (stockData: Database['public']['Tables']['stock_productos']['Insert']) => {
  const { data, error } = await supabase
    .from('stock_productos')
    .insert(stockData)
    .select()
    .single()

  if (error) {
    console.error('Error creating stock producto:', error)
    throw new Error(`Error al crear stock: ${error.message}`)
  }

  // Actualizar stock_de_productos en la tabla productos
  await updateStockDeProductos(data.producto_id)

  return data
}

// Update stock producto
export const updateStockProducto = async (id: number, updates: Database['public']['Tables']['stock_productos']['Update']) => {
  const { data, error } = await supabase
    .from('stock_productos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating stock producto:', error)
    throw new Error(`Error al actualizar stock: ${error.message}`)
  }

  // Si se actualiza el estado, sincronizar stock_de_productos
  if (updates.estado !== undefined) {
    await updateStockDeProductos(data.producto_id)
  }

  return data
}

// Delete stock producto
export const deleteStockProducto = async (id: number) => {
  // Primero obtener información del stock antes de eliminar
  const { data: stockItem, error: fetchError } = await supabase
    .from('stock_productos')
    .select('producto_id, estado')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching stock producto:', fetchError)
    throw new Error(`Error al obtener información del stock: ${fetchError.message}`)
  }

  // Verificar si el stock está vendido
  if (stockItem.estado === 'vendido') {
    throw new Error('No se puede eliminar esta cuenta porque ya está vendida y tiene referencias en el sistema. Las cuentas vendidas deben permanecer en el historial.')
  }

  const { error } = await supabase
    .from('stock_productos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting stock producto:', error)
    
    // Verificar si es un error de foreign key constraint (stock tiene referencias)
    if (error.code === '23503') {
      throw new Error('No se puede eliminar esta cuenta porque tiene referencias en el sistema (ventas asociadas).')
    }
    
    throw new Error(`Error al eliminar stock: ${error.message}`)
  }

  // Actualizar stock_de_productos en la tabla productos
  await updateStockDeProductos(stockItem.producto_id)

  return true
}
