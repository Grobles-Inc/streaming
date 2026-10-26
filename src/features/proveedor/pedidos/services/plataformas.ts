import { supabase } from '@/lib/supabase'
import type { PlataformaOption } from '../data/types'

/**
 * Plataformas activas para el <Select> de configuración IMAP. La tabla es la
 * fuente de verdad: desactivar una plataforma es un UPDATE `activo = false`,
 * sin tocar código.
 */
export const getPlataformasActivas = async (): Promise<PlataformaOption[]> => {
  const { data, error } = await supabase
    .from('plataformas')
    .select('id, label')
    .eq('activo', true)
    .order('label', { ascending: true })

  if (error) {
    console.error('Error fetching plataformas:', error)
    throw error
  }

  return data ?? []
}
