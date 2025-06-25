import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as cuentasService from '../services'
import { toast } from 'sonner'

// Query para obtener todas las cuentas del proveedor autenticado
export const useCuentas = () => {
  return useQuery({
    queryKey: ['cuentas'],
    queryFn: () => cuentasService.getCuentasPaginated(),
  })
}

// Query para obtener cuentas del proveedor sin paginación
export const useCuentasByProveedor = () => {
  return useQuery({
    queryKey: ['cuentas', 'proveedor'],
    queryFn: () => cuentasService.getCuentasByProveedor(),
  })
}

export const useCreateCuenta = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cuentasService.createCuenta,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] })
      toast.success('Cuenta creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la cuenta')
    },
  })
}

export const useCuentasById = (id:number) => {
  return useQuery({
    queryKey: ['cuentas', id],
    queryFn: () => cuentasService.getCuentaById(id),
    enabled: !!id,
  })
}

export const useCuentasByProductoId = (productoId:string) =>  {
  return useQuery({
    queryKey: ['cuentas', 'producto', productoId],
    queryFn: () => cuentasService.getCuentasByProductoId(productoId),
    enabled: !!productoId,
  })
}

export const useUpdateCuenta = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      cuentasService.updateCuenta(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] })
      toast.success('Cuenta actualizada correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar la cuenta')
    },
  })
}

export const useDeleteCuenta = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cuentasService.deleteCuenta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuentas'] })
      toast.success('Cuenta eliminada correctamente')
    },
    onError: () => {
      toast.error('Error al eliminar la cuenta')
    },
  })
}
