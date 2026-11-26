import { supabase } from '@/lib/supabase'

import type { ArchivoContableRow, PurgaContableResult } from '../data/types'

export class ContabilidadService {
  /**
   * Obtiene la última purga contable registrada
   */
  static async getUltimaPurga(): Promise<ArchivoContableRow | null> {
    const { data, error } = await supabase
      .from('contabilidad_archivo')
      .select('*')
      .order('ejecutado_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching última purga contable:', error)
      throw new Error('Error al obtener la última purga contable')
    }

    return data
  }

  /**
   * Archiva los totales y elimina recargas/retiros con más de `dias`
   * días de antigüedad. El balance contable no cambia porque el RPC suma
   * el archivo a los datos vivos.
   */
  static async purgar(dias = 60): Promise<PurgaContableResult> {
    const { data, error } = await supabase.rpc('purgar_recargas_retiros', {
      p_dias: dias,
    })

    if (error) {
      console.error('Error ejecutando purga contable:', error)
      throw new Error(
        error.message === 'NO_AUTORIZADO'
          ? 'Solo un administrador puede ejecutar la purga'
          : 'Error al ejecutar la purga contable'
      )
    }

    return data as PurgaContableResult
  }
}
