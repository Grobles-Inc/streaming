import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
/**
 * Producto con el join `usuarios` (proveedor) que agregan las consultas.
 */
export type Producto = Database['public']['Tables']['productos']['Row'] & {
  usuarios?: { usuario: string; nombres: string } | null
}
export type CompraInsert = Database['public']['Tables']['compras']['Insert']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']
export type StockProducto = Database['public']['Tables']['stock_productos']['Update']
export type Billetera = Database['public']['Tables']['billeteras']['Row']

/**
 * Fila del RPC `get_compras_vendedor`. El jsonb serializa los `timestamptz`
 * a ISO string y anida los joins como objetos (no arrays).
 */
export type CompraVendedorRow = Omit<
  Database['public']['Tables']['compras']['Row'],
  'renovado' | 'revisado_id' | 'updated_at'
> & {
  productos: {
    nombre: string | null
    tiempo_uso: number | null
    precio_publico: number | null
    precio_renovacion: number | null
    descripcion: string | null
    informacion: string | null
    condiciones: string | null
    renovable: boolean | null
  } | null
  usuarios: {
    usuario: string | null
    nombres: string | null
    apellidos: string | null
    telefono: string | null
    billetera_id: string | null
  } | null
  stock_productos: {
    email: string | null
    perfil: string | null
    pin: string | null
    clave: string | null
    url: string | null
  } | null
}

/** Respuesta jsonb completa del RPC `get_compras_vendedor`. */
export type GetComprasVendedorResponse = {
  data: CompraVendedorRow[]
  count: number
}

// Fila ligera de una compra con datos de cuenta pendientes de revisar
// (notificación de cambio de info de cuenta). Alimenta la campana.
export type CompraCuentaActualizada = {
  id: number
  created_at: string
  updated_at: string | null
  mensaje_notificacion: string | null
  productos: { nombre: string | null } | null
  stock_productos: {
    email: string | null
    perfil: string | null
    pin: string | null
    clave: string | null
    url: string | null
  } | null
}

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

export const updateCompraStatus = async (id:number, status: string, message: string, subject: string, response?: string, monto_reembolso?: number): Promise<Compra | null> => {
  const { data, error } = await supabase
    .from('compras')
    .update({ 
      estado: status, 
      soporte_mensaje: message, 
      soporte_asunto: subject, 
      soporte_respuesta: response || null,
      monto_reembolso: monto_reembolso !== undefined ? monto_reembolso : undefined
    })
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
    .update({ fecha_expiracion: newDate.toISOString(), renovado: true, estado: 'renovado' })
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

// Get compras by vendedor ID (RPC `get_compras_vendedor`)
export const getComprasByVendedorId = async (
  vendedorId: string,
  page: number = 1,
  pageSize: number = 200
): Promise<{ data: CompraVendedorRow[]; count: number }> => {
  const { data, error } = await supabase.rpc('get_compras_vendedor', {
    p_vendedor_id: vendedorId,
    p_page: page,
    p_page_size: pageSize,
    p_estado: null,
    p_search: null,
  })

  if (error) {
    console.error('Error fetching compras by vendedor:', error)
    return { data: [], count: 0 }
  }

  const result = data as unknown as GetComprasVendedorResponse | null

  return { data: result?.data ?? [], count: result?.count ?? 0 }
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
      usuarios:proveedor_id (nombres, apellidos, billetera_id, usuario),
      stock_productos:stock_producto_id (email, perfil, pin, clave, url)
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
      usuarios:proveedor_id (nombres, usuario)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }
  return data
}

// Compras del vendedor con cambios de cuenta pendientes de revisar.
export const getComprasCuentaActualizada = async (
  vendedorId: string
): Promise<CompraCuentaActualizada[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      id,
      created_at,
      updated_at,
      mensaje_notificacion,
      productos:producto_id (nombre),
      stock_productos:stock_producto_id (email, perfil, pin, clave, url)
    `)
    .eq('vendedor_id', vendedorId)
    .eq('cuenta_actualizada', true)
    .order('updated_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching compras con cuenta actualizada:', error)
    return []
  }

  return (data as unknown as CompraCuentaActualizada[]) || []
}

// Marca como revisada la notificación de cambio de cuenta. RPC con RLS:
// valida automáticamente vendedor_id = auth.uid().
export const marcarCuentaActualizadaRevisada = async (
  compraId: number
): Promise<boolean> => {
  const { error } = await supabase.rpc('marcar_cuenta_actualizada_revisada', {
    p_compra_id: compraId,
  })

  if (error) {
    console.error('Error marcando cuenta como revisada:', error)
    return false
  }

  return true
}