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

export const useStockProductosIds = (productoId: string) => {
  return useQuery({
    queryKey: ['stock-productos-ids', productoId],
    queryFn: () => stockProductosService.getStockProductosIds(productoId),
  })
}

export const useRemoveIdFromStockProductos = () => {
  return useMutation({
    mutationFn: ({ productoId }: { productoId: string }) => stockProductosService.removeIdFromStockProductos(productoId),
  })
}

export const useUpdateStockProductoStatusVendido = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => stockProductosService.updateStockProductoStatusVendido(id),
  })
}


