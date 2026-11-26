import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ContabilidadService } from '../services/contabilidad.service'
import type { ArchivoContableRow, PurgaContableResult } from '../data/types'

export function usePurgaContable() {
  const [ultimaPurga, setUltimaPurga] = useState<ArchivoContableRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUltimaPurga = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ContabilidadService.getUltimaPurga()
      setUltimaPurga(data)
    } catch (err) {
      console.error('Error loading última purga contable:', err)
      setError(
        err instanceof Error ? err.message : 'Error al cargar la última purga'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUltimaPurga()
  }, [loadUltimaPurga])

  const purgar = async (dias: number): Promise<PurgaContableResult | null> => {
    try {
      setPurging(true)
      setError(null)

      const result = await ContabilidadService.purgar(dias)
      await loadUltimaPurga()

      const totalFilas = result.filas_recargas + result.filas_retiros

      if (totalFilas === 0) {
        toast.info(`No había registros con más de ${dias} días`)
      } else {
        toast.success(
          `Purga completada: ${result.filas_recargas} recargas y ${result.filas_retiros} retiros`
        )
      }

      return result
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al ejecutar la purga'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setPurging(false)
    }
  }

  return {
    ultimaPurga,
    loading,
    purging,
    error,
    purgar,
    reload: loadUltimaPurga,
  }
}
