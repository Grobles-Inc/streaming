import { useCallback, useEffect, useRef, useState } from 'react'
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'
import type { AvailabilityStatus } from '../api/check-availability'

/**
 * Debounced availability check bound to a react-hook-form field.
 *
 * Owns three things at once so no form has to repeat them: the debounce, the
 * in flight cancellation (so a slow early response cannot overwrite a fast
 * later one), and mirroring the verdict onto the form as a validation error so
 * submit is blocked before it reaches the server.
 */

export type AvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'duplicate'
  | 'error'

const MIN_LENGTH = 3
const DEFAULT_DEBOUNCE_MS = 800

interface UseAvailabilityFieldOptions<T extends FieldValues> {
  check: (value: string) => Promise<AvailabilityStatus>
  form: UseFormReturn<T>
  fieldName: Path<T>
  duplicateMessage: string
  /** Shown when the value is free. Pass '' to stay silent, as email does. */
  availableMessage?: string
  errorMessage?: string
  debounceMs?: number
}

export function useAvailabilityField<T extends FieldValues>({
  check,
  form,
  fieldName,
  duplicateMessage,
  availableMessage = '',
  errorMessage = 'Error al verificar disponibilidad',
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: UseAvailabilityFieldOptions<T>) {
  const [state, setState] = useState<AvailabilityState>('idle')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runIdRef = useRef(0)

  const validate = useCallback(
    (value: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      const trimmed = value.trim()
      if (trimmed.length < MIN_LENGTH) {
        // Bump the run id so any pending response is ignored.
        runIdRef.current += 1
        setState('idle')
        return
      }

      setState('checking')
      runIdRef.current += 1
      const runId = runIdRef.current

      timeoutRef.current = setTimeout(async () => {
        const status = await check(trimmed)
        if (runId !== runIdRef.current) return
        setState(status)
      }, debounceMs)
    },
    [check, debounceMs]
  )

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  useEffect(() => {
    if (state === 'duplicate') {
      form.setError(fieldName, { type: 'manual', message: duplicateMessage })
      return
    }
    // Only clear a duplicate error we own; never a message the schema produced.
    if (form.formState.errors[fieldName]?.message === duplicateMessage) {
      form.clearErrors(fieldName)
    }
  }, [state, form, fieldName, duplicateMessage])

  const message =
    state === 'duplicate'
      ? duplicateMessage
      : state === 'available'
        ? availableMessage
        : state === 'error'
          ? errorMessage
          : ''

  return {
    state,
    validate,
    isChecking: state === 'checking',
    isDuplicate: state === 'duplicate',
    message,
  }
}
