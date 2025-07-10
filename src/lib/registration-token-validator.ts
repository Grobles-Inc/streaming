import { ConfigurationService } from '@/services/configuration.service'

export interface RegistrationTokenData {
  referralCode?: string
  role: string
  validationToken: string
  isValid: boolean
}

/**
 * Middleware para validar tokens de registro
 */
export class RegistrationTokenValidator {
  
  /**
   * Valida un token de registro
   */
  static async validateToken(token: string): Promise<RegistrationTokenData> {
    console.log("Validando token:", token);
    
    try {
      if (!token) {
        console.error("Token vacío o nulo");
        return {
          role: 'registered',
          validationToken: '',
          isValid: false
        }
      }

      // Parsear URL para extraer parámetros
      let validationToken = token;
      let referralCode = undefined;
      
      // Si el token parece ser una URL completa o tiene parámetros
      if (token.includes('?')) {
        try {
          // Intentar crear una URL completa
          let url;
          if (token.startsWith('http')) {
            url = new URL(token);
          } else {
            // Si no es una URL completa, crear una ficticia para parsear los parámetros
            url = new URL(`http://example.com${token.startsWith('/') ? token : `/${token}`}`);
          }
          
          validationToken = url.searchParams.get('token') || '';
          referralCode = url.searchParams.get('ref') || undefined;
          
          console.log("Token extraído de URL:", validationToken);
          console.log("Código de referido extraído de URL:", referralCode);
        } catch (e) {
          console.error("Error parseando token como URL:", e);
        }
      }
      
      if (!validationToken || validationToken.trim() === '') {
        console.error("Token de validación vacío o inválido");
        return {
          role: 'registered',
          validationToken: '',
          isValid: false
        }
      }

      // Validar el token contra la base de datos
      console.log("Validando token:", validationToken);
      const isTokenValid = await ConfigurationService.validateRegistrationToken(validationToken);
      console.log("¿Token válido según la base de datos?", isTokenValid);

      // Para mantener compatibilidad con el resto del sistema
      return {
        referralCode,
        role: 'registered', // El rol siempre es 'registered' en el nuevo sistema
        validationToken,
        isValid: isTokenValid
      }
    } catch (error) {
      console.error('Error validating registration token:', error)
      return {
        role: 'registered',
        validationToken: '',
        isValid: false
      }
    }
  }

  /**
   * Verifica si el registro está permitido basándose en el token
   */
  static async isRegistrationAllowed(token?: string): Promise<{
    allowed: boolean
    data?: RegistrationTokenData
    reason?: string
  }> {
    // Si no hay token, el registro no está permitido
    if (!token) {
      return {
        allowed: false,
        reason: 'Token de registro requerido. Use un link de invitación válido.'
      }
    }

    // Validar el token
    const tokenData = await this.validateToken(token)

    if (!tokenData.isValid) {
      return {
        allowed: false,
        reason: 'Token de registro inválido o expirado. Solicite un nuevo link de invitación.'
      }
    }

    return {
      allowed: true,
      data: tokenData
    }
  }

  /**
   * Invalida un token después de su uso exitoso
   */
  static async invalidateToken(_validationToken: string): Promise<boolean> {
    try {
      // Generar un nuevo token para invalidar el actual
      const newToken = ConfigurationService.generateRegistrationToken()
      return await ConfigurationService.storeRegistrationToken(newToken)
    } catch (error) {
      console.error('Error invalidating token:', error)
      return false
    }
  }
}
