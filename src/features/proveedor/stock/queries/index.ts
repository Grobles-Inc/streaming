import { keepPreviousData, useQuery } from '@tanstack/react-query'
import * as stockService from '../services'
import type { GetStockProveedorParams } from '../data/types'

// Stock del proveedor con paginación, búsqueda y filtros resueltos en el
// servidor vía RPC `get_stock_proveedor`.
export const useStockProveedor = (params: GetStockProveedorParams) => {
  return useQuery({
    queryKey: [
      'stock-productos',
      'proveedor',
      params.proveedorId,
      'list',
      params,
    ],
    queryFn: () => stockService.getStockProveedor(params),
    enabled: !!params.proveedorId,
    // evita el flash de tabla vacía al cambiar de página
    placeholderData: keepPreviousData,
  })
}

// Reutilizar queries existentes de productos
export {
  useDeleteStockProducto,
  useUpdateStockProducto,
  useProductosByProveedor,
} from '../../productos/queries'
