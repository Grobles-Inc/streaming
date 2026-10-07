import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import { mapSupabaseUserToComponent, type UserRole } from '../data/schema'
import { useUsersAdmin } from '../queries'
import type { GetUsersAdminParams } from '../services/users.service'

// La página inicial es de 50 filas; el selector permite 50, 100 y 200
const DEFAULT_PAGE_SIZE = 50
const DEFAULT_SORT_BY = 'created_at'
const NOMBRE_COLUMN_ID = 'nombreCompleto'
const ROL_COLUMN_ID = 'rol'
const SEARCH_DEBOUNCE_MS = 400

const resolveUpdater = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === 'function'
    ? (updater as (prev: T) => T)(current)
    : updater

const getSearchFromColumnFilters = (
  columnFilters: ColumnFiltersState
): string => {
  const value = columnFilters.find((f) => f.id === NOMBRE_COLUMN_ID)?.value
  return typeof value === 'string' ? value : ''
}

const getRolesFromColumnFilters = (
  columnFilters: ColumnFiltersState
): UserRole[] => {
  const value = columnFilters.find((f) => f.id === ROL_COLUMN_ID)?.value
  if (!Array.isArray(value)) return []
  return value.map(String) as UserRole[]
}

/**
 * Dueño del estado de la tabla de usuarios (paginación, orden, filtros) y del
 * mapeo de ese estado a los parámetros del RPC `get_users_admin`.
 * `UsersTable` queda como componente presentacional: recibe el estado y los
 * handlers ya resueltos.
 */
export function useUsersTabla() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: DEFAULT_SORT_BY, desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Retrasa la búsqueda por nombre para no disparar una request por cada tecla
  const [search] = useDebounce(
    getSearchFromColumnFilters(columnFilters),
    SEARCH_DEBOUNCE_MS
  )
  const roles = getRolesFromColumnFilters(columnFilters)

  const params = useMemo<GetUsersAdminParams>(
    () => ({
      search,
      roles,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      sortBy: sorting[0]?.id ?? DEFAULT_SORT_BY,
      sortDir: sorting[0]?.desc === false ? 'asc' : 'desc',
    }),
    [search, roles, pagination.pageIndex, pagination.pageSize, sorting]
  )

  const { data, isPending, error, refetch } = useUsersAdmin(params)

  // TanStack no resetea el índice de página al cambiar filtros u ordenamiento,
  // así que lo forzamos para no quedar en una página fuera de rango.
  const resetPageIndex = () =>
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    )

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((prev) => resolveUpdater(updater, prev))
  }

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((prev) => resolveUpdater(updater, prev))
    resetPageIndex()
  }

  const handleColumnFiltersChange = (
    updater: Updater<ColumnFiltersState>
  ) => {
    setColumnFilters((prev) => resolveUpdater(updater, prev))
    resetPageIndex()
  }

  return {
    rows: (data?.rows ?? []).map(mapSupabaseUserToComponent),
    total: data?.total ?? 0,
    isLoading: isPending,
    error,
    refetch,
    pagination,
    sorting,
    columnFilters,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
  }
}
