import { supabase } from '@/lib/supabase'

export interface SupabaseFunctionResult<T> {
  /** `true` solo si la función respondió 2xx con un body JSON. */
  ok: boolean
  status: number
  /** Body parseado, o `null` si no hubo respuesta utilizable (offline, relay, HTML). */
  data: T | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseJsonBody = async (response: Response): Promise<unknown> => {
  try {
    return await response.json()
  } catch {
    // El gateway puede devolver HTML o texto plano ante un 5xx.
    return null
  }
}

/**
 * Invoca una Supabase Edge Function y normaliza la respuesta.
 *
 * `supabase.functions.invoke` devuelve `{ data, error }` y nunca tira, pero en
 * un 4xx/5xx deja `data = null` y el body viene adentro de `error.context`
 * (la Response). Sin parsear ese body se pierden los errores de negocio —los
 * `reason`, y los flags `not_enabled` / `needs_config` que el frontend usa para
 * elegir el mensaje—, así que se recupera acá una sola vez.
 *
 * La identidad viaja en `x-user-id` porque la app usa auth custom
 * (`public.usuarios` + localStorage) y no hay JWT de Supabase que enviar. Por
 * eso las functions IMAP van con `verify_jwt = false`.
 */
export const invokeSupabaseFunction = async <T>(
  functionName: string,
  body: Record<string, unknown>,
  userId: string
): Promise<SupabaseFunctionResult<T>> => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
    headers: { 'x-user-id': userId },
  })

  if (!error) {
    return {
      ok: true,
      status: 200,
      data: isRecord(data) ? (data as T) : null,
    }
  }

  const response = error.context instanceof Response ? error.context : null
  if (!response) {
    // FunctionsFetchError (offline) o FunctionsRelayError sin respuesta.
    return { ok: false, status: 0, data: null }
  }

  const parsed = await parseJsonBody(response)
  return {
    ok: response.ok,
    status: response.status,
    data: isRecord(parsed) ? (parsed as T) : null,
  }
}