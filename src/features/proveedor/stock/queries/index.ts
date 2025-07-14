import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row'] & {
  producto?: {
    id: string
    nombre: string
    estado: string
  }
}

// Query para obtener todo el stock del proveedor
export const useStockProductosByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['stock-productos', 'proveedor', proveedorId],
    queryFn: async (): Promise<StockProducto[]> => {
      const { data, error } = await supabase
        .from('stock_productos')
        .select(`
          *,
          producto:productos!inner (
            id,
            nombre,
            estado
          )
        `)
        .eq('proveedor_id', proveedorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error al obtener stock del proveedor:', error)
        throw new Error('Error al cargar el stock')
      }

      return data || []
    },
    enabled: !!proveedorId,
  })
}

// Reutilizar queries existentes de productos
export { 
  useDeleteStockProducto, 
  useUpdateStockProducto, 
  useProductosByProveedor 
} from '../../productos/queries' 