import { useEffect, useState } from 'react'

/**
 * Retarda la propagación de `value` para no disparar una request por cada tecla
 * que el usuario escribe en el input de búsqueda.
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)

    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}