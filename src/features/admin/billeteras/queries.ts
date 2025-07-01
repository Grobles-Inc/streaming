import { useState, useEffect } from 'react'
import { BilleterasService } from './services'
import type { Billetera, Recarga, Retiro } from './data/types'

export function useBilleteras() {
  const [billeteras, setBilleteras] = useState<Billetera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBilleteras = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BilleterasService.getBilleteras()
      setBilleteras(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar billeteras')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBilleteras()
  }, [])

  return {
    billeteras,
    loading,
    error,
    refetch: fetchBilleteras
  }
}

export function useRecargas() {
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecargas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BilleterasService.getRecargas()
      setRecargas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar recargas')
    } finally {
      setLoading(false)
    }
  }

  const createRecarga = async (recargaData: { usuario_id: string; monto: number }) => {
    try {
      const newRecarga = await BilleterasService.createRecarga(recargaData)
      setRecargas(prev => [newRecarga, ...prev])
      return newRecarga
    } catch (err) {
      throw err
    }
  }

  const updateRecargaEstado = async (recargaId: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      const updatedRecarga = await BilleterasService.updateRecargaEstado(recargaId, estado)
      setRecargas(prev => prev.map(recarga => 
        recarga.id === recargaId ? updatedRecarga : recarga
      ))
      return updatedRecarga
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRecargas()
  }, [])

  return {
    recargas,
    loading,
    error,
    createRecarga,
    updateRecargaEstado,
    refetch: fetchRecargas
  }
}

export function useRetiros() {
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRetiros = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await BilleterasService.getRetiros()
      setRetiros(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar retiros')
    } finally {
      setLoading(false)
    }
  }

  const createRetiro = async (retiroData: { usuario_id: string; monto: number }) => {
    try {
      const newRetiro = await BilleterasService.createRetiro(retiroData)
      setRetiros(prev => [newRetiro, ...prev])
      return newRetiro
    } catch (err) {
      throw err
    }
  }

  const updateRetiroEstado = async (retiroId: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      const updatedRetiro = await BilleterasService.updateRetiroEstado(retiroId, estado)
      setRetiros(prev => prev.map(retiro => 
        retiro.id === retiroId ? updatedRetiro : retiro
      ))
      return updatedRetiro
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRetiros()
  }, [])

  return {
    retiros,
    loading,
    error,
    createRetiro,
    updateRetiroEstado,
    refetch: fetchRetiros
  }
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await BilleterasService.getUsuarios()
        setUsuarios(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  return {
    usuarios,
    loading,
    error
  }
}
