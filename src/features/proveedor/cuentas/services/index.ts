import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Cuentas = Database['public']['Tables']['stock_productos']['Row'] & {
  productos?: Database['public']['Tables']['productos']['Row']
}
export type CuentasInsert = Database['public']['Tables']['stock_productos']['Insert']
export type CuentasUpdate = Database['public']['Tables']['stock_productos']['Update']

// Crear nueva cuenta y actualizar stock_de_productos
export const createCuenta = async (cuenta: CuentasInsert) : Promise<Cuentas | null> => {
  // Iniciar transacción
  const { data: cuentaCreada, error: cuentaError } = await supabase
    .from('stock_productos')
    .insert(cuenta)
    .select(`
      *,
      productos(*)
    `)
    .single()

  if (cuentaError) {
    console.error('Error al crear cuenta:', cuentaError)
    return null
  }

  // Ahora actualizar el campo stock_de_productos del producto
  if (cuentaCreada) {
    // Primero obtenemos el producto actual para ver su stock_de_productos
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('stock_de_productos')
      .eq('id', cuenta.producto_id)
      .single()

    if (productoError) {
      console.error('Error al obtener producto:', productoError)
      // La cuenta ya se creó, pero no pudimos actualizar el producto
      return cuentaCreada
    }

    // Agregar el ID de la nueva cuenta al array de stock_de_productos
    const stockActual = producto.stock_de_productos as { id: number }[] || []
    const nuevoStock = [...stockActual, { id: cuentaCreada.id }]

    // Actualizar el producto con el nuevo stock
    const { error: updateError } = await supabase
      .from('productos')
      .update({ 
        stock_de_productos: nuevoStock,
        stock: nuevoStock.length // También actualizar el campo stock
      })
      .eq('id', cuenta.producto_id)

    if (updateError) {
      console.error('Error al actualizar stock del producto:', updateError)
      // La cuenta se creó exitosamente, pero no se pudo actualizar el stock del producto
    } else {
      console.log('✅ Cuenta creada y stock del producto actualizado correctamente')
    }
  }

  return cuentaCreada
}

// Obtener cuenta por ID con información del producto
export const getCuentaById = async (id:number) : Promise<Cuentas | null> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select(`
      *,
      productos(*)
    `)
    .eq('id', id)
    .single()

    if (error) {
      console.error('Error al obtener cuenta:', error)
      return null
    }
    return data
}

// Obtener cuentas por Producto ID
export const getCuentasByProductoId = async (productoId:string) : Promise<Cuentas[]> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .select(`
      *,
      productos(*)
    `)
    .eq('producto_id', productoId)
    .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener cuentas:', error)
      return []
    }
    return data || []
}

// Obtener todas las cuentas de productos del proveedor autenticado
export const getCuentasByProveedor = async () : Promise<Cuentas[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const { data, error } = await supabase
    .from('stock_productos')
    .select(`
      *,
      productos!inner(*)
    `)
    .eq('productos.proveedor_id', user.id)
    .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener cuentas del proveedor:', error)
      return []
    }
    return data || []
}

// Actualizar cuenta
export const updateCuenta = async (id:number, updates: CuentasUpdate) : Promise<Cuentas | null> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      productos(*)
    `)
    .single()

    if (error) {
      console.error('Error al actualizar cuenta:', error)
      return null
    }
    return data
}

// Eliminar cuenta y actualizar stock_de_productos
export const deleteCuenta = async (id:number) : Promise<boolean> => {
  // Primero obtener la cuenta para saber a qué producto pertenece
  const { data: cuenta, error: getCuentaError } = await supabase
    .from('stock_productos')
    .select('producto_id')
    .eq('id', id)
    .single()

  if (getCuentaError) {
    console.error('Error al obtener cuenta a eliminar:', getCuentaError)
    return false
  }

  // Eliminar la cuenta
  const { error: deleteError } = await supabase
    .from('stock_productos')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Error al eliminar cuenta:', deleteError)
    return false
  }

  // Actualizar el stock_de_productos del producto
  if (cuenta) {
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('stock_de_productos')
      .eq('id', cuenta.producto_id)
      .single()

    if (!productoError && producto) {
      const stockActual = producto.stock_de_productos as { id: number }[] || []
      const nuevoStock = stockActual.filter(item => item.id !== id)

      await supabase
        .from('productos')
        .update({ 
          stock_de_productos: nuevoStock,
          stock: nuevoStock.length
        })
        .eq('id', cuenta.producto_id)
    }
  }

  return true
}

// Get cuentas with pagination para el proveedor autenticado
export const getCuentasPaginated = async (
  page: number = 1,
  pageSize: number = 10
) : Promise<{ data: Cuentas[]; count: number }> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('stock_productos')
    .select(`
      *,
      productos!inner(*)
    `, { count: 'exact' })
    .eq('productos.proveedor_id', user.id)
    .range(from, to)
    .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener cuentas:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
}
