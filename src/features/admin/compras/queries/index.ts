import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { EstadoCompra, GetComprasAdminParams } from '../data/types'
import { ComprasService } from '../services/compras.service'

export const COMPRAS_QUERY_KEY = ['compras'] as const

/**
 * Listado de compras con paginación, búsqueda y filtro por estado resueltos en
 * el servidor vía RPC `get_compras_admin`.
 */
export const useComprasAdmin = (params: GetComprasAdminParams) => {
  return useQuery({
    queryKey: [...COMPRAS_QUERY_KEY, 'admin', 'list', params],
    queryFn: () => ComprasService.getComprasPaginadas(params),
    // evita el flash de tabla vacía al cambiar de página/filtro
    placeholderData: keepPreviousData,
  })
}

const useInvalidateCompras = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: COMPRAS_QUERY_KEY })
}

export const useCambiarEstadoCompra = () => {
  const invalidate = useInvalidateCompras()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoCompra }) =>
      ComprasService.cambiarEstadoCompra(id, estado),
    onSuccess: invalidate,
  })
}

export const useCambiarEstadoMasivo = () => {
  const invalidate = useInvalidateCompras()
  return useMutation({
    mutationFn: ({ ids, estado }: { ids: number[]; estado: EstadoCompra }) =>
      ComprasService.cambiarEstadoMasivo(ids, estado),
    onSuccess: invalidate,
  })
}
