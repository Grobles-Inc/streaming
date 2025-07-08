import { useState, useEffect, useCallback } from 'react'
import { RecargasService } from '../services/recargas.service'
import { mapSupabaseRecargaToComponent } from '../data/schema'
import type { 
  MappedRecarga, 
  EstadoRecarga, 
  EstadisticasRecargas, 
  FiltroRecarga 
} from '../data/types'

export function useRecargas(filtrosIniciales?: FiltroRecarga) {
  const [recargas, setRecargas] = useState<MappedRecarga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasRecargas | null>(null)
  const [filtros, setFiltros] = useState<FiltroRecarga>(filtrosIniciales || {})

  // Cargar recargas
  const loadRecargas = useCallback(async (nuevosFiltros?: FiltroRecarga) => {
    try {
      setLoading(true)
      const filtrosAUsar = nuevosFiltros || filtros
      const supabaseRecargas = await RecargasService.getRecargas(filtrosAUsar)
      const mappedRecargas = supabaseRecargas.map(mapSupabaseRecargaToComponent)
      setRecargas(mappedRecargas)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar recargas')
      console.error('Error loading recargas:', err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const stats = await RecargasService.getEstadisticas()
      setEstadisticas(stats)
    } catch (err) {
      console.error('Error loading estadísticas:', err)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    loadRecargas()
    loadEstadisticas()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Aprobar recarga
  const aprobarRecarga = async (id: number): Promise<boolean> => {
    try {
      await RecargasService.aprobarRecarga(id)
      // Recargar todas las recargas en lugar de intentar actualizar individualmente
      await loadRecargas()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar recarga')
      console.error('Error approving recarga:', err)
      return false
    }
  }

  // Rechazar recarga
  const rechazarRecarga = async (id: number): Promise<boolean> => {
    try {
      await RecargasService.rechazarRecarga(id)
      // Recargar todas las recargas en lugar de intentar actualizar individualmente
      await loadRecargas()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar recarga')
      console.error('Error rejecting recarga:', err)
      return false
    }
  }

  // Actualizar estado de recarga (genérica para el modal)
  const updateEstadoRecarga = async (id: number, estado: EstadoRecarga): Promise<boolean> => {
    if (estado === 'aprobado') {
      return await aprobarRecarga(id)
    } else if (estado === 'rechazado') {
      return await rechazarRecarga(id)
    } else if (estado === 'pendiente') {
      // Para cambiar a pendiente, usamos la función genérica de actualización
      try {
        await RecargasService.updateRecarga(id, { estado: 'pendiente' })
        await loadRecargas()
        await loadEstadisticas()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar recarga')
        console.error('Error updating recarga to pending:', err)
        return false
      }
    }
    return false
  }

  // Aprobar múltiples recargas
  const aprobarRecargas = async (ids: number[]): Promise<boolean> => {
    try {
      await RecargasService.aprobarRecargas(ids)
      // Recargar todas las recargas
      await loadRecargas()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar recargas')
      console.error('Error approving recargas:', err)
      return false
    }
  }

  // Rechazar múltiples recargas
  const rechazarRecargas = async (ids: number[]): Promise<boolean> => {
    try {
      await RecargasService.rechazarRecargas(ids)
      // Recargar todas las recargas
      await loadRecargas()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar recargas')
      console.error('Error rejecting recargas:', err)
      return false
    }
  }

  // Aplicar filtros
  const aplicarFiltros = async (nuevosFiltros: FiltroRecarga) => {
    setFiltros(nuevosFiltros)
    await loadRecargas(nuevosFiltros)
  }

  // Limpiar filtros
  const limpiarFiltros = async () => {
    const filtrosVacios = {}
    setFiltros(filtrosVacios)
    await loadRecargas(filtrosVacios)
  }

  // Refrescar datos
  const refreshRecargas = () => {
    loadRecargas()
    loadEstadisticas()
  }

  // Limpiar error
  const clearError = () => setError(null)

  // Ver detalles de una recarga
  const verDetallesRecarga = async (id: number): Promise<MappedRecarga | null> => {
    try {
      const recarga = await RecargasService.getRecargaById(id)
      if (recarga) {
        return mapSupabaseRecargaToComponent(recarga)
      }
      return null
    } catch (err) {
      console.error('Error getting recarga details:', err)
      return null
    }
  }

  return {
    recargas,
    loading,
    error,
    estadisticas,
    filtros,
    // Acciones
    aprobarRecarga,
    rechazarRecarga,
    updateEstadoRecarga,
    aprobarRecargas,
    rechazarRecargas,
    aplicarFiltros,
    limpiarFiltros,
    refreshRecargas,
    clearError,
    verDetallesRecarga,
    // Estado
    hayRecargas: recargas.length > 0,
    recargasPendientes: recargas.filter(r => r.estado === 'pendiente'),
    cantidadPendientes: recargas.filter(r => r.estado === 'pendiente').length,
  }
}
