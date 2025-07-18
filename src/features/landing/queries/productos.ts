import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productosService from '../services/productos'
import * as stockProductosService from '../services/stock'

export const useProductos = () => {
  return useQuery({
    queryKey: ['productos'],
    queryFn: () => productosService.getProductosPaginated(),
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

export const useUpdateStockProductoStatusVendido = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; productoId: number }) => stockProductosService.updateStockProductoStatusVendido(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stock-productos-ids', variables.productoId] })
    },
  })
}


