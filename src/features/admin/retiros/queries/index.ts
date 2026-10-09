import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { GetRetirosAdminParams } from '../data/types'
import { RetirosService } from '../services/retiros.service'

export const RETIROS_QUERY_KEY = ['retiros'] as const

/**
 * Listado de retiros con paginación, búsqueda y filtro por estado resueltos en
 * el servidor vía RPC `get_retiros_admin`.
 */
export const useRetirosAdmin = (params: GetRetirosAdminParams) => {
  return useQuery({
    queryKey: [...RETIROS_QUERY_KEY, 'admin', 'list', params],
    queryFn: () => RetirosService.getRetirosPaginados(params),
    // evita el flash de tabla vacía al cambiar de página/filtro
    placeholderData: keepPreviousData,
  })
}

const useInvalidateRetiros = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: RETIROS_QUERY_KEY })
}

export const useAprobarRetiro = () => {
  const invalidate = useInvalidateRetiros()
  return useMutation({
    mutationFn: (id: number) => RetirosService.aprobarRetiro(id),
    onSuccess: invalidate,
  })
}

export const useRechazarRetiro = () => {
  const invalidate = useInvalidateRetiros()
  return useMutation({
    mutationFn: (id: number) => RetirosService.rechazarRetiro(id),
    onSuccess: invalidate,
  })
}

export const useAprobarRetiros = () => {
  const invalidate = useInvalidateRetiros()
  return useMutation({
    mutationFn: (ids: number[]) => RetirosService.aprobarRetiros(ids),
    onSuccess: invalidate,
  })
}

export const useRechazarRetiros = () => {
  const invalidate = useInvalidateRetiros()
  return useMutation({
    mutationFn: (ids: number[]) => RetirosService.rechazarRetiros(ids),
    onSuccess: invalidate,
  })
}
