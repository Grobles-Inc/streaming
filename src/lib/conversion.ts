import { supabase } from '@/lib/supabase'

// Tasa única de respaldo cuando la configuración no está disponible.
// configuracion.conversion = soles por 1 USD.
export const DEFAULT_CONVERSION = 3.7

export async function getLatestConversion(): Promise<number> {
  const { data, error } = await supabase
    .from('configuracion')
    .select('conversion')
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return DEFAULT_CONVERSION
  }

  if (!data.conversion || data.conversion <= 0) {
    return DEFAULT_CONVERSION
  }

  return data.conversion
}
