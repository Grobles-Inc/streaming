import { decryptReferralData } from '@/lib/encryption'
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
   * Valida un token de registro encriptado
   */
  static async validateToken(encryptedToken: string): Promise<RegistrationTokenData> {
    try {
      // Desencriptar el token
      const decryptedData = decryptReferralData(encryptedToken)
      
      if (!decryptedData) {
        return {
          role: 'registered',
          validationToken: '',
          isValid: false
        }
      }

      // Validar el token contra la base de datos
      const isTokenValid = await ConfigurationService.validateRegistrationToken(
        decryptedData.validationToken
      )

      return {
        referralCode: decryptedData.referralCode,
        role: decryptedData.role,
        validationToken: decryptedData.validationToken,
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
