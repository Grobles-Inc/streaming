import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type CompraInsert = Database['public']['Tables']['compras']['Insert']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']
export type StockProducto = Database['public']['Tables']['stock_productos']['Update']
export type Billetera = Database['public']['Tables']['billeteras']['Row']

// Create a new compra
export const createCompra = async (compra: CompraInsert): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .insert(compra)
    .select()
    .single()

  if (error) {
    console.error('Error creating compra:', error)
    return null
  }

  return data
}

// Get latest 5 compras
export const getLatestCompras = async (usuarioId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select('*, productos:producto_id (nombre, precio_publico)')
    .eq('vendedor_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching latest compras:', error)
    return []
  }

  return data
}
// Get compra by ID
export const getCompraById = async (id: number): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching compra:', error)
    return null
  }

  return data
}

// Update compra
export const updateCompra = async (id: number, updates: CompraUpdate): Promise<Compra | null> => {
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

export const updateCompraStatus = async (id:number, status: string, message: string, subject: string, response?: string): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .update({ estado: status, soporte_mensaje: message, soporte_asunto: subject, soporte_respuesta: response || null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating compra status:', error)
    return null
  }

  return data
}

export const updateStockProductoStatus = async (id: number): Promise<StockProducto | null> => {
  const { data, error } = await supabase
    .from('stock_productos')
    .update({ soporte_stock_producto: "soporte" })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating stock producto status:', error)
    return null
  }

  return data
}


export const updateCompraStatusVencido = async (id: number): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .update({ estado: 'vencido' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating compra status:', error)
    return null
  }
  return data
}


export const renovarCompra = async (id: number, tiempo_uso: number, fecha_expiracion: string, billeteraId: string, saldo: number): Promise<Compra | Billetera | null> => {
  const endDate = new Date(fecha_expiracion)
  const newDate = new Date(endDate.setDate(endDate.getDate() + tiempo_uso))

  const { data: compraData, error } = await supabase
    .from('compras')
    .update({ fecha_expiracion: newDate.toISOString(), renovado: true })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error renovando la fecha de expiracion:', error)
    return null
  }

  const { data: billeteraData, error: billeteraError } = await supabase
    .from('billeteras')
    .update({ saldo })
    .eq('id', billeteraId)
    .select()
    .single()

  if (billeteraError) {
    console.error('Error actualizando el saldo de la billetera:', billeteraError)
    return null
  }

  return compraData || billeteraData || null
}

// Recycle compra
export const reciclarCompra = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('compras')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error reciclando compra:', error)
    return false
  }

  return true
}

// Get compras by vendedor ID
export const getComprasByVendedorId = async (vendedorId: string, page: number = 1, pageSize: number = 200): Promise<{ data: Compra[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, tiempo_uso, condiciones, descripcion, informacion, precio_renovacion, renovable),
      usuarios:proveedor_id (nombres, apellidos, telefono, billetera_id, usuario),
      stock_productos:stock_producto_id (email, perfil, pin, clave)
    `, { count: 'exact' })
    .eq('vendedor_id', vendedorId)
    .neq('estado', 'reembolsado')
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching compras by vendedor:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

// Get compras with pagination
export const getComprasPaginated = async (
  page: number = 1,
  pageSize: number = 200
): Promise<{ data: Compra[]; count: number }> => {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico),
      usuarios:proveedor_id (nombres, apellidos, billetera_id),
      stock_productos:stock_producto_id (email, perfil, pin, clave)
    `, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching paginated compras:', error)
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}


//Get producto by id
export const getProductoById = async (id: number): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      usuarios:proveedor_id (nombres)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }
  return data
}