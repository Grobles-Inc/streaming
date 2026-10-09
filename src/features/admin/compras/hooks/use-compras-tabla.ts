import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type { PaginationState, Updater } from '@tanstack/react-table'
import type { EstadoCompra, GetComprasAdminParams } from '../data/types'
import { useComprasAdmin } from '../queries'

// El RPC devuelve 50 filas por defecto
const DEFAULT_PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 400

const resolveUpdater = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === 'function'
    ? (updater as (prev: T) => T)(current)
    : updater

/**
 * Dueño del estado de la tabla de compras (paginación, búsqueda y filtro por
 * estado) y del mapeo de ese estado a los parámetros del RPC
 * `get_compras_admin`. `ComprasTable` queda como componente presentacional.
 */
export function useComprasTabla(estado: EstadoCompra | null) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  // Retrasa la búsqueda para no disparar una request por cada tecla
  const [search] = useDebounce(globalFilter, SEARCH_DEBOUNCE_MS)

  const params = useMemo<GetComprasAdminParams>(
    () => ({
      search,
      estado,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [search, estado, pagination.pageIndex, pagination.pageSize]
  )

  const { data, isPending, error, refetch } = useComprasAdmin(params)

  // TanStack no resetea el índice de página al cambiar filtros/búsqueda, así que
  // lo forzamos para no quedar en una página fuera de rango.
  const resetPageIndex = () =>
    setPagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    )

  // Al cambiar el filtro por estado volvemos a la primera página
  useEffect(() => {
    resetPageIndex()
  }, [estado])

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    setPagination((prev) => resolveUpdater(updater, prev))
  }

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((prev) => resolveUpdater(updater, prev))
    resetPageIndex()
  }

  return {
    rows: data?.compras ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    totalSoporte: data?.totalSoporte ?? 0,
    isLoading: isPending,
    error,
    refetch,
    pagination,
    globalFilter,
    onPaginationChange: handlePaginationChange,
    onGlobalFilterChange: handleGlobalFilterChange,
  }
}
