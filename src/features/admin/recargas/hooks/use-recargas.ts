import { useState, useEffect, useCallback } from 'react'
import { RecargasService } from '../services/recargas.service'
import { mapSupabaseRecargaToComponent } from '../data/schema'
import { getLatestConversion } from '@/lib/conversion'
import type {
  MappedRecarga,
  EstadisticasRecargas,
  FiltroRecarga
} from '../data/types'

export function useRecargas(filtrosIniciales?: FiltroRecarga) {
  const [recargas, setRecargas] = useState<MappedRecarga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasRecargas | null>(null)
  const [filtros] = useState<FiltroRecarga>(filtrosIniciales || {})

  // Cargar recargas
  const loadRecargas = useCallback(async (nuevosFiltros?: FiltroRecarga) => {
    try {
      setLoading(true)
      const filtrosAUsar = nuevosFiltros || filtros
      const supabaseRecargas = await RecargasService.getRecargas(filtrosAUsar)
      const tasaConversion = await getLatestConversion()
      const mappedRecargas = supabaseRecargas.map((recarga) =>
        mapSupabaseRecargaToComponent(recarga, tasaConversion)
      )
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
  }, [loadRecargas, loadEstadisticas])

  // Refrescar datos
  const refreshRecargas = () => {
    loadRecargas()
    loadEstadisticas()
  }

  return {
    recargas,
    loading,
    error,
    estadisticas,
    filtros,
    refreshRecargas,
    // Estado
    hayRecargas: recargas.length > 0,
    recargasPendientes: recargas.filter(r => r.estado === 'pendiente'),
    cantidadPendientes: recargas.filter(r => r.estado === 'pendiente').length,
  }
}
