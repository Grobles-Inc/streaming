import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as recargasService from '../services'
import { toast } from 'sonner'

export const useRecargas = () => {
  return useQuery({
    queryKey: ['recargas'],
    queryFn: () => recargasService.getRecargasPaginated(),
  })
}

export const useRecargasByVendedor = (vendedorId: string) => {
  return useQuery({
    queryKey: ['recargas', 'vendedor', vendedorId],
    queryFn: () => recargasService.getRecargasByVendedorId(vendedorId),
    enabled: !!vendedorId,
  })
}

export const useRecargaById = (id: string) => {
  return useQuery({
    queryKey: ['recargas', id],
    queryFn: () => recargasService.getRecargaById(id),
    enabled: !!id,
  })
}

export const useRecargasAprobadasByVendedor = (vendedorId: string) => {
  return useQuery({
    queryKey: ['recargas', 'vendedor', vendedorId, 'aprobadas'],
    queryFn: () => recargasService.getRecargasAprobadasByVendedorId(vendedorId),
    enabled: !!vendedorId,
  })
}

export const useCreateRecarga = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recargasService.createRecarga,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recargas'] })
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      toast.success('Recarga solicitada', {
        description: 'La comisión de la recarga será reducida de tu saldo una vez aprobada.',
      })
    },
    onError: () => {
      toast.error('Error al crear la recarga')
    },
  })
}

export const useUpdateRecarga = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      recargasService.updateRecarga(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recargas'] })
      toast.success('Recarga actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la recarga')
    },
  })
}

export const useReciclarRecarga = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => recargasService.reciclarRecarga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recargas'] })
      toast.success('Recarga reciclada correctamente')
    },
    onError: () => {
      toast.error('Error al reciclar la recarga')
    },
  })
}
