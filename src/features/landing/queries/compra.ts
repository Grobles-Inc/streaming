import { useMutation } from '@tanstack/react-query'
import * as compraService from '../services/compra'
import { CompraInsert } from '../services/compra'


export const useCreateCompra = () => {
  return useMutation({
    mutationFn: (compra: CompraInsert) => compraService.createCompra(compra),
  })
}


