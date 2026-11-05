import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as compraService from '../services/compra'
import type { RegistrarCompraParams } from '../services/compra'

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : ((error as { message?: string } | null)?.message ?? '')

/**
 * Única mutación del flujo de compra. El RPC `registrar_compra` hace todo en
 * una transacción, así que acá solo invalidamos las queries afectadas.
 */
export const useRegistrarCompra = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: RegistrarCompraParams) =>
      compraService.registrarCompra(params),
    onSuccess: (_compra, params) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      queryClient.invalidateQueries({ queryKey: ['productos-all'] })
      queryClient.invalidateQueries({ queryKey: ['productos-publicados'] })
      queryClient.invalidateQueries({
        queryKey: ['stock-productos-ids', params.p_producto_id],
      })
      queryClient.invalidateQueries({ queryKey: ['billeteras'] })
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['compras'] })
      toast.success('Compra exitosa', { duration: 2000 })
    },
    onError: (error) => {
      const message = getErrorMessage(error)

      if (message.includes('SALDO_INSUFICIENTE')) {
        toast.error('No tienes saldo suficiente')
      } else if (
        message.includes('SIN_STOCK') ||
        message.includes('STOCK_NO_DISPONIBLE')
      ) {
        toast.error('No hay stock disponible para este producto')
      } else if (message.includes('PRODUCTO_NO_DISPONIBLE')) {
        toast.error('El producto ya no está disponible')
      } else {
        toast.error('Error al registrar la compra')
      }
    },
  })
}
