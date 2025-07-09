import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']
type ConfiguracionUpdate = Database['public']['Tables']['configuracion']['Update']

export class ConfigurationService {
  
  /**
   * Genera un token único y seguro para links de registro
   */
  static generateRegistrationToken(): string {
    const timestamp = Date.now().toString(36)
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const randomString = Array.from(randomBytes, byte => byte.toString(36)).join('')
    const combinedToken = `${timestamp}-${randomString}`
    
    // Crear hash más complejo para mayor seguridad
    return btoa(combinedToken)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 64) // Limitar longitud
  }

  /**
   * Almacena un token de registro en la configuración
   */
  static async storeRegistrationToken(token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('configuracion')
        .upsert({
          id: '1', // ID fijo para configuración global
          register_link: token,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error storing registration token:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error storing registration token:', error)
      return false
    }
  }

  /**
   * Valida si un token de registro es válido
   */
  static async validateRegistrationToken(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('register_link, updated_at')
        .eq('id', '1')
        .single()

      if (error || !data) {
        console.error('Error validating registration token:', error)
        return false
      }

      // Verificar que el token coincida
      if (data.register_link !== token) {
        return false
      }

      // Verificar que el token no sea muy antiguo (24 horas de validez)
      const tokenDate = new Date(data.updated_at)
      const now = new Date()
      const hoursDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff > 24) {
        console.warn('Registration token expired')
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating registration token:', error)
      return false
    }
  }

  /**
   * Obtiene la configuración actual
   */
  static async getConfiguration(): Promise<ConfiguracionRow | null> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .eq('id', '1')
        .single()

      if (error) {
        console.error('Error getting configuration:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting configuration:', error)
      return null
    }
  }

  /**
   * Actualiza la configuración
   */
  static async updateConfiguration(updates: Partial<ConfiguracionUpdate>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('configuracion')
        .upsert({
          id: '1',
          updated_at: new Date().toISOString(),
          ...updates
        })

      if (error) {
        console.error('Error updating configuration:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating configuration:', error)
      return false
    }
  }
}
