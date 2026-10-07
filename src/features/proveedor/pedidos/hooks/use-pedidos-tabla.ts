import { useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import type { GetPedidosProveedorParams, PedidoSortBy } from '../data/types'
import { usePedidosProveedor } from '../queries'
import { useDebouncedValue } from './use-debounced-value'

// El id de la columna debe coincidir con el valor aceptado por `p_sort_by`
// y con la columna contra la que filtra el RPC.
const ESTADO_COLUMN_ID = 'estado_calculado'
const DEFAULT_SORT_BY: PedidoSortBy = 'created_at'
// El RPC devuelve 50 filas por defecto
const DEFAULT_PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 400

const resolveUpdater = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === 'function'
    ? (updater as (prev: T) => T)(current)
    : updater

const getEstadosFromColumnFilters = (
  columnFilters: ColumnFiltersState
): string[] => {
  const entry = columnFilters.find((f) => f.id === ESTADO_COLUMN_ID)
  const value = entry?.value

  if (value === undefined || value === null || value === '') return []

  return Array.isArray(value) ? value.map(String) : [String(value)]
}

/**
 * Dueño del estado de la tabla (paginación, orden, filtros, búsqueda) y del
 * mapeo de ese estado a los parámetros del RPC `get_pedidos_proveedor`.
 * El `DataTable` queda como componente presentacional: recibe el estado y los
 * handlers ya resueltos.
 */
export function usePedidosTabla(proveedorId: string | undefined) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: DEFAULT_SORT_BY, desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const search = useDebouncedValue(globalFilter, SEARCH_DEBOUNCE_MS)

  const params = useMemo<GetPedidosProveedorParams>(
    () => ({
      proveedorId: proveedorId ?? '',
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search,
      estados: getEstadosFromColumnFilters(columnFilters),
      sortBy: (sorting[0]?.id as PedidoSortBy | undefined) ?? DEFAULT_SORT_BY,
      sortDir: sorting[0]?.desc === false ? 'asc' : 'desc',
    }),
    [proveedorId, pagination.pageIndex, pagination.pageSize, search, sorting, columnFilters]
  )

  const { data, isPending } = usePedidosProveedor(params)

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

  const handleColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    setColumnFilters((prev) => resolveUpdater(updater, prev))
    resetPageIndex()
  }

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((prev) => resolveUpdater(updater, prev))
    resetPageIndex()
  }

  return {
    rows: data?.rows ?? [],
    total: data?.total ?? 0,
    isLoading: isPending,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
  }
}