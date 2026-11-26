import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  ConfiguracionProveedor,
  GetUsersAdminParams,
} from '../services/users.service'
import { UsersService } from '../services/users.service'

export const USERS_QUERY_KEY = ['users'] as const

/**
 * Listado de usuarios con paginación, búsqueda por nombre y filtro por rol
 * resueltos en el servidor vía RPC `get_users_admin`.
 */
export const useUsersAdmin = (params: GetUsersAdminParams) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, 'admin', 'list', params],
    queryFn: () => UsersService.getUsersPaginated(params),
    // evita el flash de tabla vacía al cambiar de página/filtro
    placeholderData: keepPreviousData,
  })
}

export const useProviderConfig = (usuarioId: string, enabled = true) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, 'provider-config', usuarioId],
    queryFn: () => UsersService.getConfiguracionProveedor(usuarioId),
    enabled: enabled && !!usuarioId,
  })
}

export const useUpsertProviderConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      usuarioId,
      config,
    }: {
      usuarioId: string
      config: Omit<ConfiguracionProveedor, 'usuario_id'>
    }) => UsersService.upsertConfiguracionProveedor(usuarioId, config),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, 'provider-config', variables.usuarioId],
      })
    },
  })
}
