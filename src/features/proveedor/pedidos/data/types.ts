import { Database } from '@/types/supabase'
import { Pedido } from './schema'

// Tipos base de Supabase
export type Compra = Database['public']['Tables']['compras']['Row']
export type StockProducto = Database['public']['Tables']['stock_productos']['Row']

// Columnas por las que el RPC `get_pedidos_proveedor` sabe ordenar
export type PedidoSortBy =
  | 'created_at'
  | 'id'
  | 'producto_nombre'
  | 'estado_calculado'
  | 'vendedor_usuario'
  | 'vendedor_telefono'
  | 'precio'
  | 'producto_precio_renovacion'
  | 'cuenta_email'
  | 'fecha_inicio'
  | 'fecha_expiracion'
  | 'dias_restantes'

export type PedidoSortDir = 'asc' | 'desc'

export type GetPedidosProveedorParams = {
  proveedorId: string
  page: number
  pageSize: number
  search: string
  estados: string[]
  fechaDesde?: string
  fechaHasta?: string
  sortBy: PedidoSortBy
  sortDir: PedidoSortDir
}

// `total_count` viene repetido en cada fila del RPC
export type PedidosPaginados = {
  rows: Pedido[]
  total: number
}

// Tipo para el soporte de compras (usado en el modal de soporte)
export type SoporteCompra = {
  id: string
  proveedor_id: string
  producto_id: number
  vendedor_id: string | null
  stock_producto_id: number | null
  nombre_cliente: string
  telefono_cliente: string
  precio: number
  estado: string
  soporte_mensaje: string | null
  soporte_asunto: string | null
  soporte_respuesta: string | null
  monto_reembolso: number
  created_at: string
  updated_at: string
  // Datos relacionados del stock de producto
  stock_productos?: {
    id: number
    email: string | null
    clave: string | null
    pin: string | null
    perfil: string | null
    url: string | null
    soporte_stock_producto: 'activo' | 'vencido' | 'soporte'
  } | null
  // Datos relacionados del producto
  productos?: {
    nombre: string
    tiempo_uso: number
  } | null
}

// Estados de soporte para stock de productos
export type EstadoSoporteStock = 'activo' | 'soporte' | 'vencido'

// Parámetros para actualizar el estado de soporte
export type UpdateSoporteStatusParams = {
  stockProductoId: number
  estado: EstadoSoporteStock
  respuesta?: string
} 