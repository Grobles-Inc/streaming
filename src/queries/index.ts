import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as billeteraService from '../services'
import { toast } from 'sonner'


export const useBilleteraByUsuario = (usuarioId: string) => {
  return useQuery({
    queryKey: ['billeteras', 'usuario', usuarioId],
    queryFn: () => billeteraService.getBilleteraByUsuarioId(usuarioId),
    enabled: !!usuarioId,
  })
}

export const useBilleteraById = (id: string) => {
  return useQuery({
    queryKey: ['billeteras', id],
    queryFn: () => billeteraService.getBilleteraById(id),
    enabled: !!id,
  })
}

export const useCreateBilletera = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: billeteraService.createBilletera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Billetera creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la billetera')
    },
  })
}

export const useUpdateBilletera = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      billeteraService.updateBilletera(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Billetera actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la billetera')
    },
  })
}

export const useUpdateBilleteraSaldo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, nuevoSaldo }: { id: string; nuevoSaldo: number }) => 
      billeteraService.updateBilleteraSaldo(id, nuevoSaldo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Saldo actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el saldo')
    },
  })
}

export const useDeleteBilletera = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => billeteraService.deleteBilletera(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Billetera eliminada correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar la billetera')
    },
  })
}
