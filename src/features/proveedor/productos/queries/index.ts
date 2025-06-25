import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as productosService from '../services'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

type ProductoInsert = Database['public']['Tables']['productos']['Insert']

export const useProductosByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['productos', 'proveedor', proveedorId],
    queryFn: () => productosService.getProductosByProveedorId(proveedorId),
    enabled: !!proveedorId,
  })
}

export const useProductosPaginatedByProveedor = (
  proveedorId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ['productos', 'proveedor', proveedorId, 'paginated', page, pageSize],
    queryFn: () => productosService.getProductosPaginated(proveedorId, page, pageSize),
    enabled: !!proveedorId,
  })
}

export const useProductoById = (id: string) => {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosService.getProductoById(id),
    enabled: !!id,
  })
}

export const useProductosStatsByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['productos', 'proveedor', proveedorId, 'stats'],
    queryFn: () => productosService.getProductosStatsByProveedor(proveedorId),
    enabled: !!proveedorId,
  })
}

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => productosService.getCategorias(),
  })
}

export const useCreateProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoInsert) => {
      console.log('🔄 useCreateProducto: Iniciando mutación con datos:', data)
      return productosService.createProducto(data)
    },
    onSuccess: (result) => {
      console.log('✅ useCreateProducto: Mutación exitosa, resultado:', result)
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto creado correctamente')
    },
    onError: (error: Error) => {
      console.error('❌ useCreateProducto: Error en mutación:', error)
      toast.error(error.message || 'Error al crear el producto')
    },
  })
}

export const useUpdateProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Database['public']['Tables']['productos']['Update'] }) => 
      productosService.updateProducto(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el producto')
    },
  })
}

export const useDeleteProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => productosService.deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto eliminado correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar el producto')
    },
  })
} 