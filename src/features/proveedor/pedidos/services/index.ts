import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

export type Compra = Database['public']['Tables']['compras']['Row']
export type Usuario = Database['public']['Tables']['usuarios']['Row']
export type Producto = Database['public']['Tables']['productos']['Row']
export type CompraUpdate = Database['public']['Tables']['compras']['Update']

// Get compras by proveedor ID (pedidos/ventas del proveedor)
export const getComprasByProveedorId = async (proveedorId: string): Promise<Compra[]> => {
  const { data, error } = await supabase
    .from('compras')
    .select(`
      *,
      productos:producto_id (nombre, precio_publico, stock)
    `)
    .eq('proveedor_id', proveedorId)
    .order('fecha_inicio', { ascending: false })

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
      productos:producto_id (nombre, precio_publico, stock)
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
    .order('fecha_inicio', { ascending: false })
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
      productos:producto_id (nombre, precio_publico, stock)
    `, { count: 'exact' })
    .eq('proveedor_id', proveedorId)
    .range(from, to)
    .order('fecha_inicio', { ascending: false })

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