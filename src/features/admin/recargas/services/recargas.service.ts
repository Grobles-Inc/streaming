import { supabase } from '@/lib/supabase'
import type { 
  SupabaseRecarga, 
  UpdateRecargaData, 
  RecargaWithUser,
  EstadoRecarga,
  EstadisticasRecargas,
  FiltroRecarga
} from '../data/types'

export class RecargasService {
  // Obtener todas las recargas con información del usuario
  static async getRecargas(filtros?: FiltroRecarga): Promise<RecargaWithUser[]> {
    let query = supabase
      .from('recargas')
      .select(`
        *,
        usuario:usuarios!usuario_id (
          id,
          nombres,
          apellidos,
          telefono
        )
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }
    
    if (filtros?.fechaDesde) {
      query = query.gte('created_at', filtros.fechaDesde)
    }
    
    if (filtros?.fechaHasta) {
      query = query.lte('created_at', filtros.fechaHasta)
    }
    
    if (filtros?.usuarioId) {
      query = query.eq('usuario_id', filtros.usuarioId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching recargas:', error)
      throw error
    }

    // Debug: Log para ver qué datos estamos recibiendo
    console.log('Raw recargas data from Supabase:', JSON.stringify(data, null, 2))

    return (data || []).map(recarga => ({
      ...recarga,
      usuario: recarga.usuario || null
    })) as RecargaWithUser[]
  }

  // Obtener recarga por ID
  static async getRecargaById(id: number): Promise<RecargaWithUser | null> {
    const { data, error } = await supabase
      .from('recargas')
      .select(`
        *,
        usuario:usuarios!usuario_id (
          id,
          nombres,
          apellidos,
          telefono
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Recarga no encontrada
      }
      console.error('Error fetching recarga by ID:', error)
      throw error
    }

    return {
      ...data,
      usuario: data.usuario || null
    } as RecargaWithUser
  }

  // Actualizar recarga
  static async updateRecarga(id: number, updates: UpdateRecargaData): Promise<SupabaseRecarga> {
    const { data, error } = await supabase
      .from('recargas')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating recarga:', error)
      throw error
    }

    return data as SupabaseRecarga
  }

  // Aprobar recarga
  static async aprobarRecarga(id: number): Promise<SupabaseRecarga> {
    return this.updateRecarga(id, { estado: 'aprobado' })
  }

  // Rechazar recarga
  static async rechazarRecarga(id: number): Promise<SupabaseRecarga> {
    return this.updateRecarga(id, { estado: 'rechazado' })
  }

  // Obtener estadísticas de recargas
  static async getEstadisticas(): Promise<EstadisticasRecargas> {
    const { data, error } = await supabase
      .from('recargas')
      .select('monto, estado')

    if (error) {
      console.error('Error fetching recargas statistics:', error)
      throw error
    }

    const recargas = data || []
    
    const estadisticas: EstadisticasRecargas = {
      total: recargas.length,
      aprobadas: recargas.filter(r => r.estado === 'aprobado').length,
      pendientes: recargas.filter(r => r.estado === 'pendiente').length,
      rechazadas: recargas.filter(r => r.estado === 'rechazado').length,
      montoTotal: recargas.reduce((sum, r) => sum + (r.monto || 0), 0),
      montoAprobado: recargas.filter(r => r.estado === 'aprobado').reduce((sum, r) => sum + (r.monto || 0), 0),
      montoPendiente: recargas.filter(r => r.estado === 'pendiente').reduce((sum, r) => sum + (r.monto || 0), 0),
      montoRechazado: recargas.filter(r => r.estado === 'rechazado').reduce((sum, r) => sum + (r.monto || 0), 0),
    }

    return estadisticas
  }

  // Aprobar múltiples recargas
  static async aprobarRecargas(ids: number[]): Promise<SupabaseRecarga[]> {
    const { data, error } = await supabase
      .from('recargas')
      .update({ 
        estado: 'aprobado' as EstadoRecarga,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select('*')

    if (error) {
      console.error('Error approving multiple recargas:', error)
      throw error
    }

    return data as SupabaseRecarga[]
  }

  // Rechazar múltiples recargas
  static async rechazarRecargas(ids: number[]): Promise<SupabaseRecarga[]> {
    const { data, error } = await supabase
      .from('recargas')
      .update({ 
        estado: 'rechazado' as EstadoRecarga,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select('*')

    if (error) {
      console.error('Error rejecting multiple recargas:', error)
      throw error
    }

    return data as SupabaseRecarga[]
  }
}