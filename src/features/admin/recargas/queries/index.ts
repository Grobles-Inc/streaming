import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { GetRecargasAdminParams } from '../data/types'
import { RecargasService } from '../services/recargas.service'

export const RECARGAS_QUERY_KEY = ['recargas'] as const

/**
 * Listado de recargas con paginación, búsqueda y filtro por estado resueltos en
 * el servidor vía RPC `get_recargas_admin`.
 */
export const useRecargasAdmin = (params: GetRecargasAdminParams) => {
  return useQuery({
    queryKey: [...RECARGAS_QUERY_KEY, 'admin', 'list', params],
    queryFn: () => RecargasService.getRecargasPaginadas(params),
    // evita el flash de tabla vacía al cambiar de página/filtro
    placeholderData: keepPreviousData,
  })
}

const useInvalidateRecargas = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: RECARGAS_QUERY_KEY })
}

export const useAprobarRecarga = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (id: number) => RecargasService.aprobarRecarga(id),
    onSuccess: invalidate,
  })
}

export const useRechazarRecarga = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (id: number) => RecargasService.rechazarRecarga(id),
    onSuccess: invalidate,
  })
}

export const useEliminarRecarga = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (id: number) => RecargasService.eliminarRecarga(id),
    onSuccess: invalidate,
  })
}

export const useAprobarRecargas = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (ids: number[]) => RecargasService.aprobarRecargas(ids),
    onSuccess: invalidate,
  })
}

export const useRechazarRecargas = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (ids: number[]) => RecargasService.rechazarRecargas(ids),
    onSuccess: invalidate,
  })
}

export const useEliminarRecargas = () => {
  const invalidate = useInvalidateRecargas()
  return useMutation({
    mutationFn: (ids: number[]) => RecargasService.eliminarRecargas(ids),
    onSuccess: invalidate,
  })
}
