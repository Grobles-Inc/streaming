import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import {  UpdateSoporteStatusParams } from '../data/types'

export type Compra = Database['public']['Tables']['compras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']
export type StockProducto = Database['public']['Tables']['stock_productos']['Row']

// Get compras by proveedor ID (pedidos/ventas del proveedor)
export const getComprasByProveedorId = async (proveedorId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, tiempo_uso),
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
      productos:producto_id (nombre, precio_publico)
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
      productos:producto_id (nombre, precio_publico)
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
      productos:producto_id (nombre, precio_publico)
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

