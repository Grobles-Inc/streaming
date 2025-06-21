import { useQuery } from '@tanstack/react-query'
import * as productosService from '../services/productos'

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


