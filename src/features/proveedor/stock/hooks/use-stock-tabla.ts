import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table'
import type { GetStockProveedorParams, StockSortBy } from '../data/types'
import { useStockProveedor } from '../queries'

// Los ids deben coincidir con los accessorKey de las columnas filtrables
const TIPO_COLUMN_ID = 'tipo'
const ESTADO_COLUMN_ID = 'estado'
const DEFAULT_SORT_BY: StockSortBy = 'created_at'
// El RPC devuelve 50 filas por defecto
const DEFAULT_PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 400

const resolveUpdater = <T,>(updater: Updater<T>, current: T): T =>
  typeof updater === 'function'
    ? (updater as (prev: T) => T)(current)
    : updater

const getFilterValue = (
  columnFilters: ColumnFiltersState,
  id: string
): string | null => {
  const value = columnFilters.find((filter) => filter.id === id)?.value

  if (value === undefined || value === null || value === '') return null

  return Array.isArray(value) ? String(value[0]) : String(value)
}

/**
 * Dueño del estado de la tabla de stock (paginación, orden, filtros, búsqueda)
 * y del mapeo de ese estado a los parámetros del RPC `get_stock_proveedor`.
 * `StockTable` queda como componente presentacional.
 */
export function useStockTabla(proveedorId: string | undefined) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: DEFAULT_SORT_BY, desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Retrasa la búsqueda para no disparar una request por cada tecla
  const [search] = useDebounce(globalFilter, SEARCH_DEBOUNCE_MS)

  const params = useMemo<GetStockProveedorParams>(
    () => ({
      proveedorId: proveedorId ?? '',
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search,
      tipo: getFilterValue(columnFilters, TIPO_COLUMN_ID),
      estado: getFilterValue(columnFilters, ESTADO_COLUMN_ID),
      // Sin filtros en la UI todavía; el RPC los acepta y aquí van desactivados
      publicado: null,
      soporte: null,
      sortBy: (sorting[0]?.id as StockSortBy | undefined) ?? DEFAULT_SORT_BY,
      sortDir: sorting[0]?.desc === false ? 'asc' : 'desc',
    }),
    [
      proveedorId,
      pagination.pageIndex,
      pagination.pageSize,
      search,
      sorting,
      columnFilters,
    ]
  )

  const { data, isPending, error } = useStockProveedor(params)

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
    error,
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
