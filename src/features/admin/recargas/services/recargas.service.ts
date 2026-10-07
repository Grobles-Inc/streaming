import { supabase } from '@/lib/supabase'
import type { 
  SupabaseRecarga, 
  UpdateRecargaData, 
  RecargaWithUser,
  EstadoRecarga,
  EstadisticasRecargas,
  FiltroRecarga,
  GetRecargasAdminParams,
  GetRecargasAdminResponse,
  RecargasPaginadas
} from '../data/types'

export class RecargasService {
  /**
   * Lista de recargas con paginación, búsqueda y filtro por estado resueltos en
   * el servidor por el RPC `get_recargas_admin`.
   */
  static async getRecargasPaginadas(
    params: GetRecargasAdminParams
  ): Promise<RecargasPaginadas> {
    const { data, error } = await supabase.rpc('get_recargas_admin', {
      p_search: params.search || null,
      p_estado: params.estado,
      p_page: params.page,
      p_page_size: params.pageSize,
    })

    if (error) {
      console.error('Error fetching recargas paginadas:', error)
      throw error
    }

    const result = data as unknown as GetRecargasAdminResponse | null

    // El RPC devuelve las fechas como ISO string; la tabla y el modal esperan Date
    const recargas = (result?.data ?? []).map((recarga) => ({
      ...recarga,
      fechaCreacion: new Date(recarga.fechaCreacion),
      fechaActualizacion: new Date(recarga.fechaActualizacion),
    }))

    return {
      recargas,
      total: result?.total ?? 0,
      page: result?.page ?? params.page,
      pageSize: result?.pageSize ?? params.pageSize,
      totalPages: result?.totalPages ?? 0,
      totalPendientes: result?.totalPendientes ?? 0,
    }
  }

  // Obtener todas las recargas con información del usuario
  static async getRecargas(filtros?: FiltroRecarga): Promise<RecargaWithUser[]> {
    let query = supabase
      .from('recargas')
      .select(`
        *,
        usuario:usuarios!usuario_id (
          id,
          usuario,
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
          usuario,
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

  // Eliminar recarga (solo si está rechazada)
  static async eliminarRecarga(id: number): Promise<boolean> {
    // Verificar que la recarga esté rechazada antes de eliminar
    const { data: recarga, error: fetchError } = await supabase
      .from('recargas')
      .select('id, estado')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching recarga for deletion:', fetchError)
      throw fetchError
    }

    if (!recarga || recarga.estado !== 'rechazado') {
      throw new Error('Solo se pueden eliminar recargas rechazadas')
    }

    const { error } = await supabase
      .from('recargas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting recarga:', error)
      throw error
    }

    return true
  }

  // Eliminar múltiples recargas rechazadas
  static async eliminarRecargas(ids: number[]): Promise<boolean> {
    // Verificar que todas las recargas estén rechazadas antes de eliminar
    const { data: recargas, error: fetchError } = await supabase
      .from('recargas')
      .select('id, estado')
      .in('id', ids)

    if (fetchError) {
      console.error('Error fetching recargas for deletion:', fetchError)
      throw fetchError
    }

    const recargasNoRechazadas = recargas?.filter(r => r.estado !== 'rechazado') || []
    
    if (recargasNoRechazadas.length > 0) {
      throw new Error('Solo se pueden eliminar recargas rechazadas')
    }

    const { error } = await supabase
      .from('recargas')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting recargas:', error)
      throw error
    }

    return true
  }
}