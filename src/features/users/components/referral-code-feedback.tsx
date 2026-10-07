import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react'
import { useReferralValidation } from '@/features/users/hooks/use-referral-validation'

interface ReferralCodeFeedbackProps {
  code: string
  /** Debounce the lookup, for fields the user is still typing in. */
  debounced?: boolean
}

/**
 * Live feedback for a referral code. Renders nothing until there is a code to
 * check, so callers can mount it unconditionally.
 */
export function ReferralCodeFeedback({
  code,
  debounced = false,
}: ReferralCodeFeedbackProps) {
  const { isValid, isLoading, referentName, validateCode } =
    useReferralValidation()
  const [debouncedCode, setDebouncedCode] = useState('')

  useEffect(() => {
    if (!debounced) return
    const timer = setTimeout(() => setDebouncedCode(code.trim()), 500)
    return () => clearTimeout(timer)
  }, [code, debounced])

  const activeCode = debounced ? debouncedCode : code.trim()

  useEffect(() => {
    if (!activeCode) return
    validateCode(activeCode)
  }, [activeCode, validateCode])

  if (!activeCode) return null

  if (isLoading) {
    return (
      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
        <Loader2 className='h-3 w-3 animate-spin' />
        Validando código de referido...
      </div>
    )
  }

  if (isValid === false) {
    return (
      <div className='text-destructive flex items-center gap-2 text-xs'>
        <AlertTriangle className='h-3 w-3' />
        Código de referido no válido
      </div>
    )
  }

  if (isValid && referentName) {
    return (
      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
        <ShieldCheck className='h-3 w-3' />
        Referido por: {referentName}
      </div>
    )
  }

  return null
}
