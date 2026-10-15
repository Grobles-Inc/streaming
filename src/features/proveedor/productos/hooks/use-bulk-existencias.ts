import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteStockProducto,
  useUpdateStockProducto,
} from '../queries'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row']

export type BulkAccion = 'publicar' | 'despublicar' | 'eliminar'

interface UseBulkExistenciasParams {
  productoEstaPublicado: boolean
  stockItems: StockProducto[]
}

/**
 * Dueño de la selección múltiple y de las acciones en lote sobre las
 * existencias de un producto.
 *
 * - Deduplica los ids seleccionados y descarta los que ya no existen.
 * - Filtra por estado destino para no repetir operaciones ya aplicadas
 *   (no re-publicar publicados, no re-despublicar sin publicar).
 * - Bloquea la publicación si el producto está en borrador y la eliminación
 *   de existencias vendidas.
 */
export function useBulkExistencias({
  productoEstaPublicado,
  stockItems,
}: UseBulkExistenciasParams) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const deleteStockMutation = useDeleteStockProducto()
  const updateStockMutation = useUpdateStockProducto()

  // La selección se cruza contra el stock actual para descartar ids removidos
  const selectedStock = useMemo(() => {
    const ids = new Set(selectedIds)
    return stockItems.filter((item) => ids.has(item.id))
  }, [stockItems, selectedIds])

  const publicables = useMemo(
    () => selectedStock.filter((item) => !item.publicado),
    [selectedStock]
  )
  const despublicables = useMemo(
    () => selectedStock.filter((item) => item.publicado),
    [selectedStock]
  )
  const eliminables = useMemo(
    () => selectedStock.filter((item) => item.estado !== 'vendido'),
    [selectedStock]
  )
  const vendidos = useMemo(
    () => selectedStock.filter((item) => item.estado === 'vendido'),
    [selectedStock]
  )

  const isPending =
    deleteStockMutation.isPending || updateStockMutation.isPending

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const toggleOne = useCallback((id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, id]))
        : prev.filter((selectedId) => selectedId !== id)
    )
  }, [])

  const allSelected =
    stockItems.length > 0 && selectedStock.length === stockItems.length
  const someSelected = selectedStock.length > 0 && !allSelected

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? stockItems.map((item) => item.id) : [])
    },
    [stockItems]
  )

  const publicar = useCallback(async () => {
    if (!productoEstaPublicado) return
    if (publicables.length === 0) {
      toast.info('Las existencias seleccionadas ya están publicadas')
      return
    }
    try {
      await Promise.all(
        publicables.map((item) =>
          updateStockMutation.mutateAsync({
            id: item.id,
            updates: { publicado: true },
          })
        )
      )
      toast.success(`${publicables.length} existencia(s) publicada(s)`)
    } catch {
      toast.error('Error al publicar algunas existencias')
    } finally {
      clearSelection()
    }
  }, [productoEstaPublicado, publicables, updateStockMutation, clearSelection])

  const despublicar = useCallback(async () => {
    if (despublicables.length === 0) {
      toast.info('Las existencias seleccionadas ya están sin publicar')
      return
    }
    try {
      await Promise.all(
        despublicables.map((item) =>
          updateStockMutation.mutateAsync({
            id: item.id,
            updates: { publicado: false },
          })
        )
      )
      toast.success(`${despublicables.length} existencia(s) despublicada(s)`)
    } catch {
      toast.error('Error al despublicar algunas existencias')
    } finally {
      clearSelection()
    }
  }, [despublicables, updateStockMutation, clearSelection])

  const eliminar = useCallback(async () => {
    if (vendidos.length > 0) {
      toast.error('No se pueden eliminar existencias vendidas', {
        description: `${vendidos.length} existencia(s) seleccionada(s) ya está(n) vendida(s) y se omitirán.`,
      })
    }
    if (eliminables.length === 0) return
    try {
      await Promise.all(
        eliminables.map((item) =>
          deleteStockMutation.mutateAsync({
            id: item.id,
            productoId: item.producto_id,
          })
        )
      )
      toast.success(`${eliminables.length} existencia(s) eliminada(s)`)
    } catch {
      toast.error('Error al eliminar algunas existencias')
    } finally {
      clearSelection()
    }
  }, [eliminables, vendidos, deleteStockMutation, clearSelection])

  return {
    selectedCount: selectedStock.length,
    publicablesCount: publicables.length,
    despublicablesCount: despublicables.length,
    eliminablesCount: eliminables.length,
    vendidosCount: vendidos.length,
    hasSelection: selectedStock.length > 0,
    allSelected,
    someSelected,
    isPending,
    isSelected: (id: number) => selectedIds.includes(id),
    toggleOne,
    toggleAll,
    clearSelection,
    publicar,
    despublicar,
    eliminar,
  }
}
