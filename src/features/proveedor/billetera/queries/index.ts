import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as billeteraService from '../services'
import { toast } from 'sonner'

export const useBilleteraByUsuario = (usuarioId: string) => {
  return useQuery({
    queryKey: ['billetera', 'usuario', usuarioId],
    queryFn: () => billeteraService.getBilleteraByUsuarioId(usuarioId),
    enabled: !!usuarioId,
  })
}

export const useBilleteraStats = (usuarioId: string) => {
  return useQuery({
    queryKey: ['billetera', 'usuario', usuarioId, 'stats'],
    queryFn: () => billeteraService.getBilleteraStats(usuarioId),
    enabled: !!usuarioId,
  })
}

export const useHistorialTransacciones = (usuarioId: string) => {
  return useQuery({
    queryKey: ['billetera', 'usuario', usuarioId, 'historial-completo'],
    queryFn: () => billeteraService.getHistorialCompleto(usuarioId),
    enabled: !!usuarioId,
  })
}

export const useAgregarFondos = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ usuarioId, monto }: { usuarioId: string; monto: number }) => 
      billeteraService.agregarFondos(usuarioId, monto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      toast.success('Fondos agregados correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al agregar fondos')
    },
  })
}

export const useCreateRetiro = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: billeteraService.createRetiro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      queryClient.invalidateQueries({ queryKey: ['recargas'] })
      toast.success('Retiro solicitado', {
        description: 'Tu solicitud de retiro ha sido enviada y será procesada pronto.',
      })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear el retiro')
    },
  })
}

export const useRetirarFondos = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ usuarioId, monto }: { usuarioId: string; monto: number }) => 
      billeteraService.retirarFondos(usuarioId, monto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      toast.success('Fondos retirados correctamente')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al retirar fondos')
    },
  })
}

export const useUpdateBilleteraSaldo = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ usuarioId, updates }: { usuarioId: string; updates: any }) => 
      billeteraService.updateBilleteraSaldo(usuarioId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billetera'] })
      toast.success('Saldo actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el saldo')
    },
  })
} 