import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']
type ConfiguracionUpdate = Database['public']['Tables']['configuracion']['Update']

export class ConfigurationService {
  
  /**
   * Genera un token único y seguro para links de registro
   */
  static generateRegistrationToken(): string {
    console.log("Generando nuevo token de registro");
    
    // Usar un formato más simple y directo para evitar problemas de codificación
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    
    const tokenParts = [
      timestamp.toString(),
      randomPart,
      "reg"  // indicador de tipo de token
    ];
    
    const combinedToken = tokenParts.join('_');
    console.log("Token generado (sin codificar):", combinedToken);
    
    // Usar un formato más directo sin base64 para evitar problemas
    return combinedToken;
  }

  /**
   * Almacena un token de registro en la configuración
   */
  static async storeRegistrationToken(token: string): Promise<boolean> {
    console.log("Almacenando token:", token);
    
    if (!token || token.trim() === '') {
      console.error('Error: intentando almacenar un token vacío');
      return false;
    }
    
    try {
      // Primero verificamos si ya existe un registro de configuración
      const { data: existingConfig, error: fetchError } = await supabase
        .from('configuracion')
        .select('id')
        .eq('id', '1')
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 es "no se encontró ningún registro"
        console.error('Error verificando configuración existente:', fetchError);
        return false;
      }
      
      const now = new Date().toISOString();
      
      // Si existe, actualizamos. Si no, insertamos.
      if (existingConfig) {
        console.log("Actualizando token existente");
        const { error } = await supabase
          .from('configuracion')
          .update({
            register_link: token,
            updated_at: now
          })
          .eq('id', '1');
          
        if (error) {
          console.error('Error actualizando token de registro:', error);
          return false;
        }
      } else {
        console.log("Creando registro de configuración nuevo");
        const { error } = await supabase
          .from('configuracion')
          .insert({
            id: '1', 
            register_link: token,
            updated_at: now,
            mantenimiento: false,
            comision: 0,
            conversion: 1,
            comision_publicacion_producto: 0,
            comision_retiro: 0
          });
          
        if (error) {
          console.error('Error creando registro de configuración:', error);
          return false;
        }
      }
      
      // Verificamos que se haya guardado correctamente
      const { data: verifyData, error: verifyError } = await supabase
        .from('configuracion')
        .select('register_link')
        .eq('id', '1')
        .single();
        
      if (verifyError) {
        console.error('Error verificando almacenamiento del token:', verifyError);
        return false;
      }
      
      console.log("Token almacenado correctamente:", verifyData.register_link);
      return verifyData.register_link === token;
    } catch (error) {
      console.error('Error storing registration token:', error)
      return false
    }
  }

  /**
   * Valida si un token de registro es válido
   */
  static async validateRegistrationToken(token: string): Promise<boolean> {
    console.log("Validando token:", token);
    
    if (!token || token.trim() === '') {
      console.error('Token inválido: token vacío');
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('register_link, updated_at')
        .eq('id', '1')
        .single()

      if (error || !data) {
        console.error('Error validando token de registro:', error)
        return false
      }

      // Log para depuración
      console.log('Token almacenado:', data.register_link);
      console.log('Token recibido:', token);
      
      // Verificar que el token coincida
      const tokenMatches = data.register_link === token;
      console.log('¿Los tokens coinciden?', tokenMatches);
      
      if (!tokenMatches) {
        return false;
      }

      // Verificar que el token no sea muy antiguo (7 días de validez)
      const tokenDate = new Date(data.updated_at)
      const now = new Date()
      const hoursDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60)
      
      console.log('Horas desde la creación del token:', hoursDiff);
      
      if (hoursDiff > 168) { // 7 días en horas
        console.warn('Token de registro expirado')
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
