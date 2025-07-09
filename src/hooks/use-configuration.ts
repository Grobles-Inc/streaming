import { useState, useEffect } from 'react'
import { ConfigurationService } from '@/services/configuration.service'
import type { Database } from '@/types/supabase'

type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']

/**
 * Hook para manejar la configuración global y tokens de registro
 */
export function useConfiguration() {
  const [configuration, setConfiguration] = useState<ConfiguracionRow | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar la configuración actual
   */
  const loadConfiguration = async () => {
    try {
      setLoading(true)
      setError(null)
      const config = await ConfigurationService.getConfiguration()
      setConfiguration(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Generar un nuevo token de registro
   */
  const generateRegistrationToken = async (): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const token = ConfigurationService.generateRegistrationToken()
      const success = await ConfigurationService.storeRegistrationToken(token)
      
      if (success) {
        // Recargar configuración para mostrar el nuevo token
        await loadConfiguration()
        return token
      }
      
      throw new Error('No se pudo generar el token')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar token')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validar un token específico
   */
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      return await ConfigurationService.validateRegistrationToken(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al validar token')
      return false
    }
  }

  /**
   * Actualizar configuración
   */
  const updateConfiguration = async (updates: Partial<ConfiguracionRow>): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const success = await ConfigurationService.updateConfiguration(updates)
      
      if (success) {
        await loadConfiguration()
      }
      
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cargar configuración al montar el hook
  useEffect(() => {
    loadConfiguration()
  }, [])

  return {
    configuration,
    loading,
    error,
    loadConfiguration,
    generateRegistrationToken,
    validateToken,
    updateConfiguration
  }
}
