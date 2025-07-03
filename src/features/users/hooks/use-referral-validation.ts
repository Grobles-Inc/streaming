import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UseReferralValidationResult {
  isValid: boolean | null // null = no validado aún, true = válido, false = inválido
  isLoading: boolean
  referentName: string | null
  validateCode: (code: string) => Promise<void>
  reset: () => void
}

export function useReferralValidation(): UseReferralValidationResult {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [referentName, setReferentName] = useState<string | null>(null)

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setIsValid(null)
      setReferentName(null)
      return
    }

    setIsLoading(true)
    
    try {
      // Buscar usuario por código de referido
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, nombres, apellidos')
        .eq('codigo_referido', code.trim())
        .single()

      if (error || !user) {
        console.log('Error or no user found:', error, 'for code:', code.trim())
        setIsValid(false)
        setReferentName(null)
      } else {
        console.log('User found:', user)
        setIsValid(true)
        setReferentName(`${user.nombres} ${user.apellidos}`)
      }
    } catch (error) {
      console.error('Error validating referral code:', error)
      setIsValid(false)
      setReferentName(null)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setIsValid(null)
    setIsLoading(false)
    setReferentName(null)
  }

  return {
    isValid,
    isLoading,
    referentName,
    validateCode,
    reset
  }
}
