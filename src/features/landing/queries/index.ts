import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as categoriasService from '../services'
import { toast } from 'sonner'

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.getCategoriasPaginated(),
  })
}

export const useCategoriaById = (id: string) => {
  return useQuery({
    queryKey: ['categorias', id],
    queryFn: () => categoriasService.getCategoriaById(id),
    enabled: !!id,
  })
}

export const useProductosByCategoria = (categoriaId: string) => {
  return useQuery({
    queryKey: ['productos', categoriaId],
    queryFn: () => categoriasService.getProductosByCategoria(categoriaId),
    enabled: !!categoriaId,
  })
}

export const useCreateCategoria = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: categoriasService.createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la categoría')
    },
  })
}

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      categoriasService.updateCategoria(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la categoría')
    },
  })
}

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => categoriasService.deleteCategoria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] })
      toast.success('Categoría eliminada correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar la categoría')
    },
  })
}
