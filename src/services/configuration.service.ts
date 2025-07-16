import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']
type ConfiguracionUpdate = Database['public']['Tables']['configuracion']['Update']

export class ConfigurationService {
  
  /**
   * Genera un token único y PERMANENTE para links de registro
   * Este token será estable y no caducará por tiempo, solo cuando se regenere explícitamente
   */
  static generateRegistrationToken(): string {
    console.log("Generando nuevo token de registro permanente");
    
    // Crear un token estable usando datos que no cambien frecuentemente
    const timestamp = Date.now();
    const randomSeed = Math.random().toString(36).substring(2, 15);
    
    // Crear una cadena base para encriptar
    const baseString = `${timestamp}_${randomSeed}_permanent_reg`;
    
    // Convertir a Base64 para hacer el token más robusto
    const stableToken = btoa(baseString).replace(/[+/=]/g, ''); // Remover caracteres problemáticos
    
    console.log("Token permanente generado:", stableToken);
    return stableToken;
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
   * NOTA: Los tokens ahora son PERMANENTES y solo se invalidan cuando se regeneran
   */
  static async validateRegistrationToken(token: string): Promise<boolean> {
    console.log("Validando token permanente:", token);
    
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
      console.log('Token almacenado en BD:', data.register_link);
      console.log('Token recibido para validar:', token);
      
      // Verificar que el token coincida exactamente
      const tokenMatches = data.register_link === token;
      console.log('¿Los tokens coinciden?', tokenMatches);
      
      if (!tokenMatches) {
        console.warn('Token no coincide con el almacenado');
        return false;
      }

      // ✅ CAMBIO IMPORTANTE: Ya no validamos por tiempo
      // Los tokens ahora son permanentes hasta que se regeneren explícitamente
      console.log('✅ Token permanente válido');
      return true;
      
    } catch (error) {
      console.error('Error validating registration token:', error)
      return false
    }
  }

  /**
   * Regenera explícitamente el token de invitación
   * Esto invalidará todos los links anteriores
   */
  static async regenerateInvitationToken(): Promise<string | null> {
    try {
      console.log("🔄 Regenerando token de invitación...");
      
      // Generar nuevo token
      const newToken = this.generateRegistrationToken();
      
      // Almacenar el nuevo token
      const stored = await this.storeRegistrationToken(newToken);
      
      if (!stored) {
        console.error('Error almacenando el nuevo token');
        return null;
      }
      
      console.log("✅ Token regenerado exitosamente:", newToken);
      return newToken;
      
    } catch (error) {
      console.error('Error regenerating invitation token:', error);
      return null;
    }
  }

  /**
   * Obtiene el token actual sin regenerarlo
   */
  static async getCurrentToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('register_link')
        .eq('id', '1')
        .single()

      if (error || !data) {
        console.log('No hay token actual, se necesita generar uno');
        return null;
      }

      return data.register_link || null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
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
