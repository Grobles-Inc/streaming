import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as comprasService from '../services'
import { toast } from 'sonner'

export const useCompras = () => {
  return useQuery({
    queryKey: ['compras'],
    queryFn: () => comprasService.getComprasPaginated(),
  })
}

export const useLatestCompras = (usuarioId: string) => {
  return useQuery({
    queryKey: ['compras', 'latest'],
    queryFn: () => comprasService.getLatestCompras(usuarioId),
  })
}



export const useComprasByVendedor = (vendedorId: string) => {
  return useQuery({
    queryKey: ['compras', 'vendedor', vendedorId],
    queryFn: () => comprasService.getComprasByVendedorId(vendedorId),
    enabled: !!vendedorId,
  })
}

export const useCompraById = (id: string) => {
  return useQuery({
    queryKey: ['compras', id],
    queryFn: () => comprasService.getCompraById(id),
    enabled: !!id,
  })
}

export const useCreateCompra = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: comprasService.createCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la compra')
    },
  })
}

export const useUpdateCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      comprasService.updateCompra(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la compra')
    },
  })
}

export const useReciclarCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => comprasService.reciclarCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra reciclada correctamente')
    },
    onError: () => {
      toast.error('Error al reciclar la compra')
    },
  })
}

export const useProductoById = (id: string) => {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => comprasService.getProductoById(id),
    enabled: !!id,
  })
}

export const useRenovarCompra = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => comprasService.renovarCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra renovada correctamente')
    },
    onError: () => {
      toast.error('Error al renovar la compra')
    },
  
  })
}
