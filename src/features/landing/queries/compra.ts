import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as compraService from '../services/compra'
import { CompraInsert } from '../services/compra'
import * as proveedorService from '../services/proveedor'


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

export const useUpdateBilleteraProveedorSaldo = () => {
  return useMutation({
    mutationFn: ({ idBilletera, precioProducto }: { idBilletera: string, precioProducto: number }) => proveedorService.updateBilleteraProveedorSaldo(idBilletera, precioProducto),
  })
}


