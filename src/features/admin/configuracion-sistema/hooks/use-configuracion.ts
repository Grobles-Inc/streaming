import { useState, useEffect } from 'react'
import { ConfiguracionService } from '../services/configuracion.service'
import type { MappedConfiguracion, HistorialConfiguracion } from '../data/types'

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState<MappedConfiguracion | null>(null)
  const [historial, setHistorial] = useState<HistorialConfiguracion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración inicial
  useEffect(() => {
    loadConfiguracion()
  }, [])

  const loadConfiguracion = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const latest = await ConfiguracionService.getLatestConfiguracion()
      
      if (latest) {
        setConfiguracion(latest)
      } else {
        // Si no hay configuración, usar valores por defecto
        const defaultConfig = ConfiguracionService.getDefaultConfiguracion()
        setConfiguracion(defaultConfig)
      }
    } catch (err) {
      console.error('Error loading configuration:', err)
      setError('Error al cargar la configuración')
      // Usar configuración por defecto en caso de error
      setConfiguracion(ConfiguracionService.getDefaultConfiguracion())
    } finally {
      setLoading(false)
    }
  }

  const loadHistorial = async () => {
    try {
      const historialData = await ConfiguracionService.getHistorialConfiguracion()
      setHistorial(historialData)
    } catch (err) {
      console.error('Error loading configuration history:', err)
      setError('Error al cargar el historial')
    }
  }

  const saveConfiguracion = async (newConfig: Omit<MappedConfiguracion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setSaving(true)
      setError(null)
      
      const savedConfig = await ConfiguracionService.saveConfiguracion(newConfig)
      
      if (savedConfig) {
        setConfiguracion(savedConfig)
        // Recargar historial para incluir la nueva entrada
        await loadHistorial()
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error saving configuration:', err)
      setError('Error al guardar la configuración')
      return false
    } finally {
      setSaving(false)
    }
  }

  const restaurarConfiguracion = async (id: string) => {
    try {
      setSaving(true)
      setError(null)
      
      const restoredConfig = await ConfiguracionService.restaurarConfiguracion(id)
      
      if (restoredConfig) {
        setConfiguracion(restoredConfig)
        // Recargar historial
        await loadHistorial()
        return true
      }
      
      return false
    } catch (err) {
      console.error('Error restoring configuration:', err)
      setError('Error al restaurar la configuración')
      return false
    } finally {
      setSaving(false)
    }
  }

  return {
    configuracion,
    historial,
    loading,
    saving,
    error,
    loadConfiguracion,
    loadHistorial,
    saveConfiguracion,
    restaurarConfiguracion
  }
}
