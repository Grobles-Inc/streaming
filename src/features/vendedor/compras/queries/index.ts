import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as comprasService from '../services'
import * as proveedorService from '../services/proveedor'
import { saveImapConfig, ImapConfigInput, requestCode, ImapNeedsConfigError } from '../services/imap'
import { toast } from 'sonner'

export const useCompras = () => {
  return useQuery({
    queryKey: ['compras'],
    queryFn: () => comprasService.getComprasPaginated(),
  })
}

export const useLatestCompras = (usuarioId: string) => {
  return useQuery({
    queryKey: ['compras', 'latest', usuarioId],
    queryFn: () => comprasService.getLatestCompras(usuarioId),
    enabled: !!usuarioId,
  })
}



export const useComprasByVendedor = (vendedorId: string) => {
  return useQuery({
    queryKey: ['compras', 'vendedor', vendedorId],
    queryFn: () => comprasService.getComprasByVendedorId(vendedorId),
    enabled: !!vendedorId,
  })
}

export const useCompraById = (id: number) => {
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
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
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

export const useUpdateCompraStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, message, subject, response, monto_reembolso }: { id: number; status: string, message : string, subject: string, response?: string, monto_reembolso?: number }) => comprasService.updateCompraStatus(id, status, message, subject, response, monto_reembolso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Estado de la compra actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el estado de la compra')
    },
  })
}

export const useUpdateStockProductoStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number }) => comprasService.updateStockProductoStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_productos'] })
    },
  })
}

export const useUpdateCompraStatusVencido = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comprasService.updateCompraStatusVencido(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
    },
  })
}

export const useReciclarCompra = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => comprasService.reciclarCompra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra reciclada correctamente')
    },
    onError: () => {
      toast.error('Error al reciclar la compra')
    },
  })
}

export const useProductoById = (id: number) => {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => comprasService.getProductoById(id),
    enabled: !!id,
  })
}

export const useRenovarCompra = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { id: number, tiempo_uso: number, fecha_expiracion: string, billeteraId: string, saldo: number }) => 
      comprasService.renovarCompra(params.id, params.tiempo_uso, params.fecha_expiracion, params.billeteraId, params.saldo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      toast.success('Compra renovada correctamente')
    },
    onError: () => {
      toast.error('Error al renovar la compra')
    },
  
  })
}

export const useUpdateBilleteraProveedorSaldo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ idBilletera, precioRenovacion }: { idBilletera: string, precioRenovacion: number }) => proveedorService.updateBilleteraProveedorSaldo(idBilletera, precioRenovacion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
    },
  })
}

export const useSaveImapConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ input, userId }: { input: ImapConfigInput, userId: string }) =>
      saveImapConfig(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imap-configs'] })
      toast.success('Configuración IMAP guardada y verificada')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar la configuración IMAP')
    },
  })
}

export const useRequestCode = () => {
  return useMutation({
    mutationFn: ({ compraId, userId }: { compraId: number, userId: string }) =>
      requestCode(compraId, userId),
    onError: (error: Error) => {
      // needs_config lo muestra el diálogo con CTA a Configurar IMAP
      if (error instanceof ImapNeedsConfigError) return
      toast.error(error.message || 'Error al obtener el código')
    },
  })
}
