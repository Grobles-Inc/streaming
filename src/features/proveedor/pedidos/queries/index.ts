import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as pedidosService from '../services'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'
import { UpdateSoporteStatusParams } from '../data/types'

type CompraUpdate = Database['public']['Tables']['compras']['Update']

export const usePedidosByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['pedidos', 'proveedor', proveedorId],
    queryFn: () => pedidosService.getComprasByProveedorId(proveedorId),
    enabled: !!proveedorId,
  })
}

export const usePedidosPaginatedByProveedor = (
  proveedorId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery({
    queryKey: ['pedidos', 'proveedor', proveedorId, 'paginated', page, pageSize],
    queryFn: () => pedidosService.getComprasPaginatedByProveedor(proveedorId, page, pageSize),
    enabled: !!proveedorId,
  })
}

export const useLatestPedidosByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['pedidos', 'proveedor', proveedorId, 'latest'],
    queryFn: () => pedidosService.getLatestComprasByProveedor(proveedorId),
    enabled: !!proveedorId,
  })
}

export const usePedidoById = (id: string) => {
  return useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => pedidosService.getCompraById(id),
    enabled: !!id,
  })
}

export const usePedidosStatsByProveedor = (proveedorId: string) => {
  return useQuery({
    queryKey: ['pedidos', 'proveedor', proveedorId, 'stats'],
    queryFn: () => pedidosService.getComprasStatsByProveedor(proveedorId),
    enabled: !!proveedorId,
  })
}

export const useUpdatePedidoStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CompraUpdate }) => 
      pedidosService.updateCompraStatus(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Estado del pedido actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el estado del pedido')
    },
  })
}

export const useConfirmarPedido = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => 
      pedidosService.updateCompraStatus(id, { estado: 'confirmado' } as CompraUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Pedido confirmado correctamente')
    },
    onError: () => {
      toast.error('Error al confirmar el pedido')
    },
  })
}

export const useRechazarPedido = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => 
      pedidosService.updateCompraStatus(id, { estado: 'rechazado' } as CompraUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Pedido rechazado')
    },
    onError: () => {
      toast.error('Error al rechazar el pedido')
    },
  })
}

export const useUpdateSoporteStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (params: UpdateSoporteStatusParams) => 
      pedidosService.updateStockProductoSoporteStatus(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      toast.success('Estado de soporte actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el estado de soporte')
    },
  })
}

export const useUpdateStockProductoAccountData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      stockProductoId, 
      accountData 
    }: { 
      stockProductoId: number
      accountData: {
        email?: string | null
        clave?: string | null
        pin?: string | null
        perfil?: string | null
        url?: string | null
      }
    }) => pedidosService.updateStockProductoAccountData(stockProductoId, accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
    onError: () => {
      toast.error('Error al actualizar los datos de la cuenta')
    },
  })
}

export const useProcesarReembolso = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      compraId, 
      proveedorId, 
      vendedorId, 
      montoReembolso 
    }: { 
      compraId: string
      proveedorId: string
      vendedorId: string
      montoReembolso: number
    }) => pedidosService.procesarReembolsoProveedor(compraId, proveedorId, vendedorId, montoReembolso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Reembolso procesado correctamente')
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el reembolso'
      toast.error(errorMessage)
    },
  })
} 

export const useCompletarSoporte = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      compraId, 
      stockProductoId, 
      respuesta 
    }: { 
      compraId: string
      stockProductoId: number
      respuesta?: string
    }) => pedidosService.completarSoporte(compraId, stockProductoId, respuesta),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['pedidos'] })
        toast.success('Soporte brindado correctamente')
      } else {
        toast.error(result.error || 'Error al completar el soporte')
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al completar el soporte'
      toast.error(errorMessage)
    },
  })
} 
