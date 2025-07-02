import { useState, useEffect, useCallback } from 'react'
import { ComprasService } from '../services/compras.service'
import { mapSupabaseCompraToComponent } from '../data/schema'
import type { 
  MappedCompra, 
  EstadoCompra, 
  EstadisticasCompras, 
  FiltroCompra 
} from '../data/types'

export function useCompras(filtrosIniciales?: FiltroCompra) {
  const [compras, setCompras] = useState<MappedCompra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasCompras | null>(null)
  const [filtros, setFiltros] = useState<FiltroCompra>(filtrosIniciales || {})

  // Cargar compras
  const loadCompras = useCallback(async (nuevosFiltros?: FiltroCompra) => {
    console.log('🎣 useCompras.loadCompras called with:', nuevosFiltros)
    try {
      setLoading(true)
      const filtrosAUsar = nuevosFiltros || filtros
      console.log('📋 Loading compras with filters:', filtrosAUsar)
      const supabaseCompras = await ComprasService.getCompras(filtrosAUsar)
      console.log('📊 Received compras from service:', supabaseCompras.length)
      const mappedCompras = supabaseCompras.map(mapSupabaseCompraToComponent)
      console.log('🗺️ Mapped compras:', mappedCompras.length)
      setCompras(mappedCompras)
      setError(null)
    } catch (err) {
      console.error('❌ Error in loadCompras:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar compras')
      console.error('Error loading compras:', err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const stats = await ComprasService.getEstadisticas()
      setEstadisticas(stats)
    } catch (err) {
      console.error('Error loading estadísticas:', err)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    loadCompras()
    loadEstadisticas()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cambiar estado de compra
  const cambiarEstadoCompra = async (id: string, nuevoEstado: EstadoCompra): Promise<{
    success: boolean
    reembolsoProcessed?: boolean
    reembolsoAmount?: number
  }> => {
    try {
      const result = await ComprasService.cambiarEstadoCompra(id, nuevoEstado)
      await loadCompras()
      await loadEstadisticas()
      return {
        success: true,
        reembolsoProcessed: result.reembolsoProcessed,
        reembolsoAmount: result.reembolsoAmount
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado de compra')
      console.error('Error changing compra status:', err)
      return { success: false }
    }
  }

  // Métodos específicos para cada estado
  const marcarComoResuelto = async (id: string) => {
    return await cambiarEstadoCompra(id, 'resuelto')
  }

  const marcarComoVencido = async (id: string) => {
    return await cambiarEstadoCompra(id, 'vencido')
  }

  const enviarASoporte = async (id: string) => {
    return await cambiarEstadoCompra(id, 'soporte')
  }

  const procesarReembolso = async (id: string) => {
    return await cambiarEstadoCompra(id, 'reembolsado')
  }

  const marcarComoPedidoEntregado = async (id: string) => {
    return await cambiarEstadoCompra(id, 'pedido_entregado')
  }

  // Cambiar estado masivo
  const cambiarEstadoMasivo = async (ids: string[], nuevoEstado: EstadoCompra): Promise<{
    success: number
    failed: number
    reembolsoTotal?: number
  }> => {
    try {
      const result = await ComprasService.cambiarEstadoMasivo(ids, nuevoEstado)
      await loadCompras()
      await loadEstadisticas()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado masivo')
      console.error('Error changing compras status massively:', err)
      return { success: 0, failed: ids.length }
    }
  }

  // Aplicar filtros
  const aplicarFiltros = async (nuevosFiltros: FiltroCompra) => {
    setFiltros(nuevosFiltros)
    await loadCompras(nuevosFiltros)
  }

  // Limpiar filtros
  const limpiarFiltros = async () => {
    const filtrosVacios = {}
    setFiltros(filtrosVacios)
    await loadCompras(filtrosVacios)
  }

  // Refrescar datos
  const refreshCompras = () => {
    loadCompras()
    loadEstadisticas()
  }

  // Limpiar error
  const clearError = () => setError(null)

  // Ver detalles de una compra
  const verDetallesCompra = async (id: string): Promise<MappedCompra | null> => {
    try {
      const compra = await ComprasService.getCompraById(id)
      if (compra) {
        return mapSupabaseCompraToComponent(compra)
      }
      return null
    } catch (err) {
      console.error('Error getting compra details:', err)
      return null
    }
  }

  return {
    compras,
    loading,
    error,
    estadisticas,
    filtros,
    // Acciones
    cambiarEstadoCompra,
    marcarComoResuelto,
    marcarComoVencido,
    enviarASoporte,
    procesarReembolso,
    marcarComoPedidoEntregado,
    cambiarEstadoMasivo,
    aplicarFiltros,
    limpiarFiltros,
    refreshCompras,
    clearError,
    verDetallesCompra,
    // Estado
    hayCompras: compras.length > 0,
    comprasResueltas: compras.filter(c => c.estado === 'resuelto'),
    comprasEnSoporte: compras.filter(c => c.estado === 'soporte'),
    cantidadResueltas: compras.filter(c => c.estado === 'resuelto').length,
    cantidadEnSoporte: compras.filter(c => c.estado === 'soporte').length,
    cantidadReembolsadas: compras.filter(c => c.estado === 'reembolsado').length,
    cantidadPedidoEntregado: compras.filter(c => c.estado === 'pedido_entregado').length,
  }
}
