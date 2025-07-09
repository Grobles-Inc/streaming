import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as productosService from '../services'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

type ProductoInsert = Database['public']['Tables']['productos']['Insert']

export const useProductosByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['productos', 'proveedor', proveedorId],
    queryFn: () => productosService.getProductosByProveedorConVerificacion(proveedorId),
    enabled: !!proveedorId,
    staleTime: 1000 * 30, // 30 segundos - para verificar vencimientos frecuentemente
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

export const useProductoById = (id: number) => {
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

// Hook para obtener configuración del sistema (comisión)
export const useConfiguracionSistema = () => {
  return useQuery({
    queryKey: ['configuracion-sistema'],
    queryFn: () => productosService.getConfiguracionActual(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para verificar saldo suficiente
export const useVerificarSaldoSuficiente = (proveedorId: string) => {
  return useQuery({
    queryKey: ['verificar-saldo', proveedorId],
    queryFn: () => productosService.verificarSaldoSuficiente(proveedorId),
    enabled: !!proveedorId,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  })
}

// Hook original para crear producto sin comisión (para casos especiales)
export const useCreateProducto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoInsert) => {
      return productosService.createProducto(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['verificar-saldo'] })
      toast.success('Producto creado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el producto')
    },
  })
}

// Hook para crear producto con comisión
export const useCreateProductoWithCommission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productosService.createProductoWithCommission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      queryClient.invalidateQueries({ queryKey: ['saldo-suficiente'] })
      toast.success('Producto creado y comisión cobrada exitosamente')
    },
    onError: (error: Error) => {
      console.error('❌ Error al crear producto con comisión:', error)
      toast.error(error.message || 'Error al crear producto')
    },
  })
}

export const usePublicarProductoWithCommission = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productoId, proveedorId }: { productoId: number, proveedorId: string }) => 
      productosService.publicarProductoWithCommission({ productoId, proveedorId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      queryClient.invalidateQueries({ queryKey: ['saldo-suficiente'] })
      toast.success('Producto publicado y comisión cobrada exitosamente')
    },
    onError: (error: Error) => {
      console.error('❌ Error al publicar producto con comisión:', error)
      toast.error(error.message || 'Error al publicar producto')
    },
  })
}

export const useUpdateProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Omit<Database['public']['Tables']['productos']['Update'], 'id'> }) => 
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

// Hook para verificar si un producto tiene cuentas asociadas
export const useVerificarProductoTieneCuentas = (productoId: number) => {
  return useQuery({
    queryKey: ['verificar-cuentas', productoId],
    queryFn: () => productosService.verificarProductoTieneCuentas(productoId),
    enabled: !!productoId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

export const useDeleteProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => productosService.deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el producto')
    },
  })
}

// === HOOKS PARA GESTIÓN DE STOCK ===

export const useStockProductosByProductoId = (productoId: number) => {
  return useQuery({
    queryKey: ['stock-productos', productoId],
    queryFn: () => productosService.getStockProductosByProductoId(productoId),
    enabled: !!productoId,
  })
}

export const useCreateStockProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (stockData: Database['public']['Tables']['stock_productos']['Insert']) => 
      productosService.createStockProducto(stockData),
    onSuccess: (data) => {
      // Invalidar queries específicas del producto
      queryClient.invalidateQueries({ queryKey: ['stock-productos', data.producto_id] })
      // Invalidar queries del proveedor (para la tabla principal de stock)
      queryClient.invalidateQueries({ queryKey: ['stock-productos', 'proveedor'] })
      // Invalidar productos
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Stock agregado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al agregar stock')
    },
  })
}

export const useUpdateStockProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Database['public']['Tables']['stock_productos']['Update'] }) => 
      productosService.updateStockProducto(id, updates),
    onSuccess: (data) => {
      // Invalidar queries específicas del producto
      queryClient.invalidateQueries({ queryKey: ['stock-productos', data.producto_id] })
      // Invalidar queries del proveedor (para la tabla principal de stock)
      queryClient.invalidateQueries({ queryKey: ['stock-productos', 'proveedor'] })
      // Invalidar productos
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Stock actualizado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar stock')
    },
  })
}

export const useDeleteStockProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id }: { id: number; productoId: number }) => 
      productosService.deleteStockProducto(id),
    onSuccess: (_, variables) => {
      // Invalidar queries específicas del producto
      queryClient.invalidateQueries({ queryKey: ['stock-productos', variables.productoId] })
      // Invalidar queries del proveedor (para la tabla principal de stock)
      queryClient.invalidateQueries({ queryKey: ['stock-productos', 'proveedor'] })
      // Invalidar productos
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Stock eliminado correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar stock')
    },
  })
}

// Hook para sincronizar stock_de_productos de todos los productos
export const useSincronizarStockDeProductos = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (proveedorId: string) => 
      productosService.sincronizarStockDeProductos(proveedorId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      if (result.success) {
        toast.success(`Stock sincronizado: ${result.sincronizados} productos actualizados`)
      } else {
        toast.error(result.error || 'Error en la sincronización')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al sincronizar stock')
    },
  })
}

// === HOOKS PARA RENOVACIÓN DE PRODUCTOS ===

export const useRenovarProducto = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productoId, proveedorId }: { productoId: number, proveedorId: string }) => 
      productosService.renovarProducto({ productoId, proveedorId }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['productos'] })
        queryClient.invalidateQueries({ queryKey: ['billetera'] })
        queryClient.invalidateQueries({ queryKey: ['verificar-saldo'] })
        toast.success('Producto renovado exitosamente por 30 días más')
      } else {
        toast.error(result.error || 'Error al renovar producto')
      }
    },
    onError: (error: Error) => {
      console.error('❌ Error al renovar producto:', error)
      toast.error(error.message || 'Error al renovar producto')
    },
  })
}

// === HOOKS PARA VERIFICACIÓN DE VENCIMIENTOS ===

export const useVerificarProductosVencidos = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (proveedorId: string) => 
      productosService.verificarYActualizarProductosVencidos(proveedorId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      
      if (result.productosActualizados > 0) {
        toast.success(
          `${result.productosActualizados} producto(s) vencido(s) despublicado(s) automáticamente`,
          { duration: 5000 }
        )
      }
      
      if (result.error) {
        toast.error(`Error en verificación: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      console.error('❌ Error al verificar productos vencidos:', error)
      toast.error(error.message || 'Error al verificar productos vencidos')
    },
  })
} 

// 🆕 Hook para verificar el estado de un stock después de un reembolso
export const useVerificarEstadoStockDespuesReembolso = (stockProductoId: number) => {
  return useQuery({
    queryKey: ['verificar-estado-stock', stockProductoId],
    queryFn: () => productosService.verificarEstadoStockDespuesReembolso(stockProductoId),
    enabled: stockProductoId > 0,
    staleTime: 0, // Siempre refrescar para obtener datos actuales
  })
} 