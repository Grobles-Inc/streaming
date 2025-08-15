import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productosService from '../services/productos'
import * as stockProductosService from '../services/stock'

export const useProductos = (page: number = 1) => {
  return useQuery({
    queryKey: ['productos', page],
    queryFn: () => productosService.getProductosPaginated(page, 20),
  })
}

export const useAllProductos = () => {
  return useQuery({
    queryKey: ['productos-all'],
    queryFn: () => productosService.getProductos(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useProductoById = (id: string) => {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosService.getProductoById(id),
    enabled: !!id,
  })
}

export const useProductosByCategoria = (categoriaId: string) => {
  return useQuery({
    queryKey: ['productos', categoriaId],
    queryFn: () => productosService.getProductosByCategoria(categoriaId),
    enabled: !!categoriaId,
  })
}

export const useStockProductosIds = (productoId: number) => {
  return useQuery({
    queryKey: ['stock-productos-ids', productoId],
    queryFn: () => stockProductosService.getStockProductosIds(productoId),
  })
}

export const useRemoveStockIdFromProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: { productoId: number, stockProductoId: number }) => stockProductosService.removeStockIdFromProducto(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export const useUpdateStockProductoStatusVendido = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; productoId: number }) => stockProductosService.updateStockProductoStatusVendido(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-productos-ids', variables.productoId] })
    },
  })
}


