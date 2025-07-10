import { useState, useCallback, useRef } from 'react'
import { UsersService } from '@/features/users/services/users.service'

interface UseReferralValidationResult {
  isValid: boolean | null // null = no validado aún, true = válido, false = inválido
  isLoading: boolean
  referentName: string | null
  validateCode: (code: string) => Promise<void>
  reset: () => void
}

// Cache para evitar múltiples llamadas al mismo código
const validationCache = new Map<string, { isValid: boolean; referentName: string | null }>()

export function useReferralValidation(): UseReferralValidationResult {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [referentName, setReferentName] = useState<string | null>(null)
  const currentValidationRef = useRef<string>('')

  const validateCode = useCallback(async (code: string) => {
    if (!code || !code.trim()) {
      setIsValid(null)
      setReferentName(null)
      return
    }

    const trimmedCode = code.trim()
    
    // Verificar caché primero
    if (validationCache.has(trimmedCode)) {
      const cached = validationCache.get(trimmedCode)!
      console.log('Usando resultado cacheado para:', trimmedCode)
      setIsValid(cached.isValid)
      setReferentName(cached.referentName)
      return
    }

    // Evitar validaciones duplicadas
    if (currentValidationRef.current === trimmedCode) {
      console.log('Validación ya en progreso para:', trimmedCode)
      return
    }

    currentValidationRef.current = trimmedCode
    setIsLoading(true)
    console.log("Validando código de referido:", trimmedCode)
    
    try {
      // Usar el servicio de usuarios para validar el código
      const referidoUsuario = await UsersService.validateReferralCode(trimmedCode)
      
      let result: { isValid: boolean; referentName: string | null }
      
      if (!referidoUsuario) {
        console.log('No se encontró usuario con el código de referido:', trimmedCode)
        result = { isValid: false, referentName: null }
      } else {
        console.log('Usuario referido encontrado:', referidoUsuario)
        result = { 
          isValid: true, 
          referentName: `${referidoUsuario.nombres} ${referidoUsuario.apellidos}` 
        }
      }
      
      // Cachear el resultado
      validationCache.set(trimmedCode, result)
      
      // Solo actualizar el estado si este código sigue siendo el actual
      if (currentValidationRef.current === trimmedCode) {
        setIsValid(result.isValid)
        setReferentName(result.referentName)
      }
    } catch (error) {
      console.error('Error validando código de referido:', error)
      
      // Cachear error como resultado inválido
      const errorResult = { isValid: false, referentName: null }
      validationCache.set(trimmedCode, errorResult)
      
      if (currentValidationRef.current === trimmedCode) {
        setIsValid(false)
        setReferentName(null)
      }
    } finally {
      if (currentValidationRef.current === trimmedCode) {
        setIsLoading(false)
        currentValidationRef.current = ''
      }
    }
  }, [])

  const reset = useCallback(() => {
    setIsValid(null)
    setIsLoading(false)
    setReferentName(null)
    currentValidationRef.current = ''
  }, [])

  return {
    isValid,
    isLoading,
    referentName,
    validateCode,
    reset
  }
}
