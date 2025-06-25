import { useMutation } from '@tanstack/react-query'
import * as compraService from '../services/compra'
import { CompraInsert } from '../services/compra'
import { toast } from 'sonner'


export const useCreateCompra = () => {
  return useMutation({
    mutationFn: (compra: CompraInsert) => compraService.createCompra(compra),
    onSuccess: () => {
      toast.success("Compra exitosa", { duration: 2000 })
    },
    onError: () => {
      toast.error("Error al crear la compra")
    },
  })
}


