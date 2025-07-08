import { useState, useEffect, useCallback } from 'react'
import { RetirosService } from '../services/retiros.service'
import { mapSupabaseRetiroToComponent } from '../data/schema'
import type { 
  MappedRetiro, 
  EstadoRetiro, 
  EstadisticasRetiros, 
  FiltroRetiro 
} from '../data/types'

export function useRetiros(filtrosIniciales?: FiltroRetiro) {
  const [retiros, setRetiros] = useState<MappedRetiro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasRetiros | null>(null)
  const [filtros, setFiltros] = useState<FiltroRetiro>(filtrosIniciales || {})

  // Cargar retiros
  const loadRetiros = useCallback(async (nuevosFiltros?: FiltroRetiro) => {
    console.log('🎣 useRetiros.loadRetiros called with:', nuevosFiltros)
    try {
      setLoading(true)
      const filtrosAUsar = nuevosFiltros || filtros
      console.log('📋 Loading retiros with filters:', filtrosAUsar)
      const supabaseRetiros = await RetirosService.getRetiros(filtrosAUsar)
      console.log('📊 Received retiros from service:', supabaseRetiros.length)
      const mappedRetiros = supabaseRetiros.map(mapSupabaseRetiroToComponent)
      console.log('🗺️ Mapped retiros:', mappedRetiros.length)
      setRetiros(mappedRetiros)
      setError(null)
    } catch (err) {
      console.error('❌ Error in loadRetiros:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar retiros')
      console.error('Error loading retiros:', err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  // Cargar estadísticas
  const loadEstadisticas = useCallback(async () => {
    try {
      const stats = await RetirosService.getEstadisticas()
      setEstadisticas(stats)
    } catch (err) {
      console.error('Error loading estadísticas:', err)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      // Primero probar la conexión
      try {
        await RetirosService.testConnection()
      } catch (err) {
        console.error('Connection test failed:', err)
      }
      
      // Luego cargar los datos
      await loadRetiros()
      await loadEstadisticas()
    }
    
    loadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Aprobar retiro
  const aprobarRetiro = async (id: string): Promise<boolean> => {
    try {
      await RetirosService.aprobarRetiro(id)
      // Recargar todos los retiros en lugar de intentar actualizar individualmente
      await loadRetiros()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar retiro')
      console.error('Error approving retiro:', err)
      return false
    }
  }

  // Rechazar retiro
  const rechazarRetiro = async (id: string): Promise<boolean> => {
    try {
      await RetirosService.rechazarRetiro(id)
      // Recargar todos los retiros en lugar de intentar actualizar individualmente
      await loadRetiros()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar retiro')
      console.error('Error rejecting retiro:', err)
      return false
    }
  }

  // Actualizar estado de retiro (genérica para el modal)
  const updateEstadoRetiro = async (id: string, estado: EstadoRetiro): Promise<boolean> => {
    if (estado === 'aprobado') {
      return await aprobarRetiro(id)
    } else if (estado === 'rechazado') {
      return await rechazarRetiro(id)
    } else if (estado === 'pendiente') {
      // Para cambiar a pendiente, usamos la función genérica de actualización
      try {
        await RetirosService.updateRetiro(id, { estado: 'pendiente' })
        await loadRetiros()
        await loadEstadisticas()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar retiro')
        console.error('Error updating retiro to pending:', err)
        return false
      }
    }
    return false
  }

  // Aprobar múltiples retiros
  const aprobarRetiros = async (ids: string[]): Promise<boolean> => {
    try {
      await RetirosService.aprobarRetiros(ids)
      // Recargar todos los retiros
      await loadRetiros()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar retiros')
      console.error('Error approving retiros:', err)
      return false
    }
  }

  // Rechazar múltiples retiros
  const rechazarRetiros = async (ids: string[]): Promise<boolean> => {
    try {
      await RetirosService.rechazarRetiros(ids)
      // Recargar todos los retiros
      await loadRetiros()
      await loadEstadisticas()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar retiros')
      console.error('Error rejecting retiros:', err)
      return false
    }
  }

  // Aplicar filtros
  const aplicarFiltros = async (nuevosFiltros: FiltroRetiro) => {
    setFiltros(nuevosFiltros)
    await loadRetiros(nuevosFiltros)
  }

  // Limpiar filtros
  const limpiarFiltros = async () => {
    const filtrosVacios = {}
    setFiltros(filtrosVacios)
    await loadRetiros(filtrosVacios)
  }

  // Refrescar datos
  const refreshRetiros = () => {
    loadRetiros()
    loadEstadisticas()
  }

  // Limpiar error
  const clearError = () => setError(null)

  // Ver detalles de un retiro
  const verDetallesRetiro = async (id: string): Promise<MappedRetiro | null> => {
    try {
      const retiro = await RetirosService.getRetiroById(id)
      if (retiro) {
        return mapSupabaseRetiroToComponent(retiro)
      }
      return null
    } catch (err) {
      console.error('Error getting retiro details:', err)
      return null
    }
  }

  return {
    retiros,
    loading,
    error,
    estadisticas,
    filtros,
    // Acciones
    aprobarRetiro,
    rechazarRetiro,
    updateEstadoRetiro,
    aprobarRetiros,
    rechazarRetiros,
    aplicarFiltros,
    limpiarFiltros,
    refreshRetiros,
    clearError,
    verDetallesRetiro,
    // Estado
    hayRetiros: retiros.length > 0,
    retirosPendientes: retiros.filter(r => r.estado === 'pendiente'),
    cantidadPendientes: retiros.filter(r => r.estado === 'pendiente').length,
  }
}
