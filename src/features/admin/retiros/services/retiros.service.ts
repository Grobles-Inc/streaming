import { supabase } from '@/lib/supabase'
import type { 
  SupabaseRetiro, 
  UpdateRetiroData, 
  RetiroWithUser,
  EstadoRetiro,
  EstadisticasRetiros,
  FiltroRetiro
} from '../data/types'

export class RetirosService {
  // Obtener todos los retiros con información del usuario y billetera
  static async getRetiros(filtros?: FiltroRetiro): Promise<RetiroWithUser[]> {
    console.log('🔍 RetirosService.getRetiros called with filters:', filtros)
    
    let query = supabase
      .from('retiros')
      .select(`
        *,
        usuario:usuarios!retiros_usuario_id_fkey (
          id,
          nombres,
          apellidos,
          telefono,
          billeteras!billeteras_usuario_id_fkey (
            id,
            saldo
          )
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

    console.log('📊 Executing query to retiros table...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching retiros:', error)
      throw error
    }

    console.log('✅ Raw retiros data from Supabase:', {
      count: data?.length || 0,
      data: JSON.stringify(data, null, 2)
    })

    return (data || []).map(retiro => ({
      ...retiro,
      usuario: retiro.usuario || null
    })) as RetiroWithUser[]
  }

  // Obtener retiro por ID con información de usuario y billetera
  static async getRetiroById(id: string): Promise<RetiroWithUser | null> {
    const { data, error } = await supabase
      .from('retiros')
      .select(`
        *,
        usuario:usuarios!retiros_usuario_id_fkey (
          id,
          nombres,
          apellidos,
          telefono,
          billeteras!billeteras_usuario_id_fkey (
            id,
            saldo
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Retiro no encontrado
      }
      console.error('Error fetching retiro by ID:', error)
      throw error
    }

    return {
      ...data,
      usuario: data.usuario || null
    } as RetiroWithUser
  }

  // Actualizar retiro
  static async updateRetiro(id: string, updates: UpdateRetiroData): Promise<SupabaseRetiro> {
    const { data, error } = await supabase
      .from('retiros')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating retiro:', error)
      throw error
    }

    return data as SupabaseRetiro
  }

  // Aprobar retiro (con validación de saldo)
  static async aprobarRetiro(id: string): Promise<SupabaseRetiro> {
    // Primero obtener el retiro con información de la billetera
    const retiroWithUser = await this.getRetiroById(id)
    if (!retiroWithUser) {
      throw new Error('Retiro no encontrado')
    }

    // Validar que el usuario tenga saldo suficiente
    const saldoBilletera = retiroWithUser.usuario?.billeteras?.[0]?.saldo || 0
    if (saldoBilletera < retiroWithUser.monto) {
      throw new Error(`Saldo insuficiente. Saldo disponible: S/ ${saldoBilletera.toFixed(2)}, Monto solicitado: S/ ${retiroWithUser.monto.toFixed(2)}`)
    }

    return this.updateRetiro(id, { estado: 'aprobado' })
  }

  // Rechazar retiro
  static async rechazarRetiro(id: string): Promise<SupabaseRetiro> {
    return this.updateRetiro(id, { estado: 'rechazado' })
  }

  // Obtener estadísticas de retiros
  static async getEstadisticas(): Promise<EstadisticasRetiros> {
    const { data, error } = await supabase
      .from('retiros')
      .select('monto, estado')

    if (error) {
      console.error('Error fetching retiros statistics:', error)
      throw error
    }

    const retiros = data || []
    
    const estadisticas: EstadisticasRetiros = {
      total: retiros.length,
      aprobadas: retiros.filter(r => r.estado === 'aprobado').length,
      pendientes: retiros.filter(r => r.estado === 'pendiente').length,
      rechazadas: retiros.filter(r => r.estado === 'rechazado').length,
      montoTotal: retiros.reduce((sum, r) => sum + (r.monto || 0), 0),
      montoAprobado: retiros.filter(r => r.estado === 'aprobado').reduce((sum, r) => sum + (r.monto || 0), 0),
      montoPendiente: retiros.filter(r => r.estado === 'pendiente').reduce((sum, r) => sum + (r.monto || 0), 0),
      montoRechazado: retiros.filter(r => r.estado === 'rechazado').reduce((sum, r) => sum + (r.monto || 0), 0),
    }

    return estadisticas
  }

  // Aprobar múltiples retiros (con validación de saldo)
  static async aprobarRetiros(ids: string[]): Promise<SupabaseRetiro[]> {
    // Validar cada retiro antes de aprobar
    const retirosValidados: string[] = []
    const errores: string[] = []

    for (const id of ids) {
      try {
        const retiroWithUser = await this.getRetiroById(id)
        if (!retiroWithUser) {
          errores.push(`Retiro ${id}: No encontrado`)
          continue
        }

        const saldoBilletera = retiroWithUser.usuario?.billeteras?.[0]?.saldo || 0
        if (saldoBilletera < retiroWithUser.monto) {
          errores.push(`Retiro ${id}: Saldo insuficiente (${saldoBilletera.toFixed(2)} < ${retiroWithUser.monto.toFixed(2)})`)
          continue
        }

        retirosValidados.push(id)
      } catch (error) {
        errores.push(`Retiro ${id}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    // Si hay errores, lanzar excepción con los detalles
    if (errores.length > 0) {
      throw new Error(`No se pudieron aprobar algunos retiros:\n${errores.join('\n')}`)
    }

    // Aprobar solo los retiros validados
    if (retirosValidados.length === 0) {
      throw new Error('No hay retiros válidos para aprobar')
    }

    const { data, error } = await supabase
      .from('retiros')
      .update({ 
        estado: 'aprobado' as EstadoRetiro,
        updated_at: new Date().toISOString()
      })
      .in('id', retirosValidados)
      .select('*')

    if (error) {
      console.error('Error approving multiple retiros:', error)
      throw error
    }

    return data as SupabaseRetiro[]
  }

  // Rechazar múltiples retiros
  static async rechazarRetiros(ids: string[]): Promise<SupabaseRetiro[]> {
    const { data, error } = await supabase
      .from('retiros')
      .update({ 
        estado: 'rechazado' as EstadoRetiro,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select('*')

    if (error) {
      console.error('Error rejecting multiple retiros:', error)
      throw error
    }

    return data as SupabaseRetiro[]
  }
}
