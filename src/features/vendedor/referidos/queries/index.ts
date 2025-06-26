import { useQuery } from '@tanstack/react-query'
import * as referidosService from '../services'

export const useReferidos = (vendedorId: string) => {
  return useQuery({
    queryKey: ['referidos', vendedorId],
    queryFn: () => referidosService.getReferidosByVendedorId(vendedorId),
    enabled: !!vendedorId,
  })
}

