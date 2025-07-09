import { useState, useEffect, useCallback } from 'react'
import { MiBilleteraService } from '../services/mi-billetera.service'
import { BilleterasService } from '@/features/admin/billeteras/services'
import type { 
  ComisionPublicacion,
  ComisionRetiro,
  EstadisticasComisiones
} from '../data/types'
import type { Billetera, Retiro } from '@/features/admin/billeteras/data/types'

export function useMiBilletera(userId: string | undefined) {
  // Estados para billetera
  const [billetera, setBilletera] = useState<Billetera | null>(null)
  const [retiros, setRetiros] = useState<Retiro[]>([])
  
  // Estados para comisiones
  const [comisionesPublicacion, setComisionesPublicacion] = useState<ComisionPublicacion[]>([])
  const [comisionesRetiro, setComisionesRetiro] = useState<ComisionRetiro[]>([])
  const [estadisticasComisiones, setEstadisticasComisiones] = useState<EstadisticasComisiones>({
    totalComisionesPublicacion: 0,
    totalComisionesRetiro: 0,
    totalComisiones: 0,
    cantidadPublicaciones: 0,
    cantidadRetiros: 0,
    promedioComisionPublicacion: 0,
    promedioComisionRetiro: 0
  })
  
  // Estados generales
  const [conversion, setConversion] = useState<number>(3.75)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos de billetera (retiros del usuario)
  const loadBilleteraData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const [billeteraData, retirosData] = await Promise.all([
        BilleterasService.getBilleteraByUsuario(userId),
        BilleterasService.getRetirosByUsuario(userId)
      ])
      
      setBilletera(billeteraData)
      setRetiros(retirosData)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos de billetera:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos de billetera')
    }
  }, [userId])

  // Cargar datos de comisiones
  const loadComisionesData = useCallback(async () => {
    if (!userId) return

    try {
      const [
        conversionData,
        comisionesPublicacionData,
        comisionesRetiroData,
        estadisticasData
      ] = await Promise.all([
        MiBilleteraService.getConversion(),
        MiBilleteraService.getComisionesPublicacion(userId),
        MiBilleteraService.getComisionesRetiro(userId),
        MiBilleteraService.getEstadisticasComisiones(userId)
      ])

      setConversion(conversionData)
      setComisionesPublicacion(comisionesPublicacionData)
      setComisionesRetiro(comisionesRetiroData)
      setEstadisticasComisiones(estadisticasData)
      setError(null)
    } catch (err) {
      console.error('Error al cargar datos de comisiones:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar comisiones')
    }
  }, [userId])

  // Cargar todos los datos
  const loadAllData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      await Promise.all([
        loadBilleteraData(),
        loadComisionesData()
      ])
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [userId, loadBilleteraData, loadComisionesData])

  // Crear retiro
  const createRetiro = useCallback(async (monto: number) => {
    if (!userId) throw new Error('Usuario no válido')

    try {
      await BilleterasService.createRetiro({
        usuario_id: userId,
        monto: monto
      })
      
      // Recargar datos después de crear
      await loadBilleteraData()
    } catch (err) {
      console.error('Error al crear retiro:', err)
      throw err
    }
  }, [userId, loadBilleteraData])

  // Actualizar estado de retiro
  const updateRetiroEstado = useCallback(async (retiroId: number, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      await BilleterasService.updateRetiroEstado(retiroId, estado)
      
      // Recargar datos después de actualizar
      await loadAllData() // Recarga todo porque un retiro aprobado puede generar comisión
    } catch (err) {
      console.error('Error al actualizar estado de retiro:', err)
      throw err
    }
  }, [loadAllData])

  // Refrescar todos los datos
  const refresh = useCallback(async () => {
    await loadAllData()
  }, [loadAllData])

  // Cargar datos iniciales
  useEffect(() => {
    if (userId) {
      loadAllData()
    }
  }, [userId, loadAllData])

  return {
    // Estados de billetera
    billetera,
    retiros,
    
    // Estados de comisiones
    comisionesPublicacion,
    comisionesRetiro,
    estadisticasComisiones,
    conversion,
    
    // Estados generales
    loading,
    error,
    
    // Acciones
    createRetiro,
    updateRetiroEstado,
    refresh,
    loadBilleteraData,
    loadComisionesData
  }
}
