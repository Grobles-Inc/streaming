import { supabase } from '@/lib/supabase'
import type { NuevaPlataforma, PlataformaOption } from '../data/types'

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

/**
 * Crea una plataforma activa. El error de Supabase se propaga tal cual para que
 * la UI pueda distinguir el choque de PK (`23505`) de un fallo de RLS.
 */
export const createPlataforma = async (
  plataforma: NuevaPlataforma
): Promise<PlataformaOption> => {
  const { data, error } = await supabase
    .from('plataformas')
    .insert({ ...plataforma, activo: true })
    .select('id, label')
    .single()

  if (error) {
    console.error('Error creando plataforma:', error)
    throw error
  }

  return data
}
