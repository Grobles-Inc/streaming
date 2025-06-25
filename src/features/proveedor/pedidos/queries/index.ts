import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as pedidosService from '../services'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

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