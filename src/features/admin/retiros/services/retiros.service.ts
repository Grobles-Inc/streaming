import { supabase } from '@/lib/supabase'
import { procesarRetiroAprobado } from '@/features/proveedor/billetera/services'
import type {
  SupabaseRetiro,
  UpdateRetiroData,
  RetiroWithUser,
  EstadoRetiro,
  EstadisticasRetiros,
  FiltroRetiro,
  GetRetirosAdminParams,
  GetRetirosAdminResponse,
  RetirosPaginados,
} from '../data/types'

export class RetirosService {
  /**
   * Lista de retiros con paginación, búsqueda y filtro por estado resueltos en
   * el servidor por el RPC `get_retiros_admin`.
   */
  static async getRetirosPaginados(
    params: GetRetirosAdminParams
  ): Promise<RetirosPaginados> {
    const { data, error } = await supabase.rpc('get_retiros_admin', {
      p_search: params.search || null,
      p_estado: params.estado,
      p_page: params.page,
      p_page_size: params.pageSize,
    })

    if (error) {
      console.error('Error fetching retiros paginados:', error)
      throw error
    }

    const result = data as unknown as GetRetirosAdminResponse | null

    // El RPC devuelve las fechas como ISO string; la tabla y el modal esperan Date
    const retiros = (result?.data ?? []).map((retiro) => ({
      ...retiro,
      fechaCreacion: new Date(retiro.fechaCreacion),
      fechaActualizacion: new Date(retiro.fechaActualizacion),
    }))

    return {
      retiros,
      total: result?.total ?? 0,
      page: result?.page ?? params.page,
      pageSize: result?.pageSize ?? params.pageSize,
      totalPages: result?.totalPages ?? 0,
      totalPendientes: result?.totalPendientes ?? 0,
    }
  }
  // Función de prueba para verificar la conectividad
  static async testConnection(): Promise<void> {
    console.log('🔍 Testing database connection...')
    
    // Test tabla retiros
    const { data: retirosData, error: retirosError, count: retirosCount } = await supabase
      .from('retiros')
      .select('*', { count: 'exact' })
      .limit(1)
    
    console.log('📊 Retiros table test:', {
      count: retirosCount,
      error: retirosError,
      hasData: !!retirosData?.length,
      sampleData: retirosData?.[0] || null
    })

    // Test tabla usuarios
    const { data: usuariosData, error: usuariosError, count: usuariosCount } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos', { count: 'exact' })
      .limit(1)
    
    console.log('📊 Usuarios table test:', {
      count: usuariosCount,
      error: usuariosError,
      hasData: !!usuariosData?.length,
      sampleData: usuariosData?.[0] || null
    })

    // Si no hay retiros, informar
    if (retirosCount === 0) {
      console.log('ℹ️ No retiros found in database. This might be expected if no retiros have been created yet.')
    }

    // Si no hay usuarios, informar
    if (usuariosCount === 0) {
      console.log('⚠️ No usuarios found in database. This might be a problem.')
    }
  }

  // Obtener todos los retiros con información del usuario y billetera
  static async getRetiros(filtros?: FiltroRetiro): Promise<RetiroWithUser[]> {
    console.log('🔍 RetirosService.getRetiros called with filters:', filtros)
    
    try {
      // Primero probemos la conexión básica
      await this.testConnection()
      
      // Consulta más simple sin filtros primero
      console.log('📊 Executing basic query to retiros table...')
      const { data: retirosBasicos, error: errorBasico } = await supabase
        .from('retiros')
        .select('*')
        .order('created_at', { ascending: false })

      if (errorBasico) {
        console.error('❌ Error fetching basic retiros:', errorBasico)
        throw errorBasico
      }

      console.log('✅ Basic retiros data from Supabase:', {
        count: retirosBasicos?.length || 0,
        sample: retirosBasicos?.[0] || 'No data',
        all: retirosBasicos
      })

      if (!retirosBasicos || retirosBasicos.length === 0) {
        console.log('⚠️ No retiros found in database')
        return []
      }

      // Aplicar filtros después si los hay
      let retirosFiltrados = retirosBasicos
      
      if (filtros?.estado) {
        retirosFiltrados = retirosFiltrados.filter(r => r.estado === filtros.estado)
        console.log(`🔍 Filtered by estado '${filtros.estado}': ${retirosFiltrados.length} results`)
      }
      
      if (filtros?.usuarioId) {
        retirosFiltrados = retirosFiltrados.filter(r => r.usuario_id === filtros.usuarioId)
        console.log(`� Filtered by usuarioId '${filtros.usuarioId}': ${retirosFiltrados.length} results`)
      }
      
      if (filtros?.fechaDesde) {
        retirosFiltrados = retirosFiltrados.filter(r => new Date(r.created_at) >= new Date(filtros.fechaDesde!))
        console.log(`🔍 Filtered by fechaDesde '${filtros.fechaDesde}': ${retirosFiltrados.length} results`)
      }
      
      if (filtros?.fechaHasta) {
        retirosFiltrados = retirosFiltrados.filter(r => new Date(r.created_at) <= new Date(filtros.fechaHasta!))
        console.log(`🔍 Filtered by fechaHasta '${filtros.fechaHasta}': ${retirosFiltrados.length} results`)
      }

      // Ahora obtengamos los datos de usuarios para cada retiro filtrado
      const retirosConUsuarios: RetiroWithUser[] = []
      
      for (const retiro of retirosFiltrados) {
        try {
          const { data: usuario, error: errorUsuario } = await supabase
            .from('usuarios')
            .select('id, usuario, nombres, apellidos, telefono, billetera_id')
            .eq('id', retiro.usuario_id)
            .single()

          if (errorUsuario) {
            console.warn(`⚠️ Could not fetch user for retiro ${retiro.id}:`, errorUsuario)
            retirosConUsuarios.push({
              ...retiro,
              usuarios: undefined
            })
          } else {
            retirosConUsuarios.push({
              ...retiro,
              usuarios: usuario
            })
          }
        } catch (err) {
          console.warn(`⚠️ Error fetching user for retiro ${retiro.id}:`, err)
          retirosConUsuarios.push({
            ...retiro,
            usuarios: undefined
          })
        }
      }

      console.log('✅ Final retiros with users:', {
        count: retirosConUsuarios.length,
        withUsers: retirosConUsuarios.filter(r => r.usuarios).length,
        withoutUsers: retirosConUsuarios.filter(r => !r.usuarios).length
      })

      return retirosConUsuarios
    } catch (error) {
      console.error('💥 Fatal error in getRetiros:', error)
      throw error
    }
  }

  // Obtener retiro por ID con información de usuario y billetera
  static async getRetiroById(id: number): Promise<RetiroWithUser | null> {
    // Primero obtener el retiro básico
    const { data: retiro, error } = await supabase
      .from('retiros')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Retiro no encontrado
      }
      console.error('Error fetching retiro by ID:', error)
      throw error
    }

    if (!retiro) {
      return null
    }

    // Obtener información del usuario
    try {
      const { data: usuario, error: errorUsuario } = await supabase
        .from('usuarios')
        .select('id, usuario, nombres, apellidos, telefono, billetera_id')
        .eq('id', retiro.usuario_id)
        .single()

      return {
        ...retiro,
        usuarios: errorUsuario ? undefined : usuario
      } as RetiroWithUser
    } catch (err) {
      console.warn(`⚠️ Error fetching user for retiro ${id}:`, err)
      return {
        ...retiro,
        usuarios: undefined
      } as RetiroWithUser
    }
  }

  // Actualizar retiro
  static async updateRetiro(id: number, updates: UpdateRetiroData): Promise<SupabaseRetiro> {
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

  // Aprobar retiro (con validación de saldo y procesamiento de fondos)
  static async aprobarRetiro(id: number): Promise<SupabaseRetiro> {
    // Primero obtener el retiro con información del usuario
    const retiroWithUser = await this.getRetiroById(id)
    if (!retiroWithUser) {
      throw new Error('Retiro no encontrado')
    }

    // Obtener saldo de la billetera del usuario
    if (!retiroWithUser.usuarios?.billetera_id) {
      throw new Error('Usuario no tiene billetera asociada')
    }

    const { data: billetera, error: billeteraError } = await supabase
      .from('billeteras')
      .select('saldo')
      .eq('id', retiroWithUser.usuarios.billetera_id)
      .single()

    if (billeteraError || !billetera) {
      throw new Error('Error al obtener información de la billetera')
    }

    // Validar que el usuario tenga saldo suficiente
    const saldoBilletera = billetera.saldo || 0
    if (saldoBilletera < retiroWithUser.monto) {
      throw new Error(`Saldo insuficiente. Saldo disponible: $ ${saldoBilletera.toFixed(2)}, Monto solicitado: $ ${retiroWithUser.monto.toFixed(2)}`)
    }

    try {
      // 1. Procesar la transferencia de fondos y comisión
      await procesarRetiroAprobado(id)
      
      // 2. Cambiar el estado a aprobado
      return this.updateRetiro(id, { estado: 'aprobado' })
    } catch (error) {
      console.error('Error procesando retiro aprobado:', error)
      throw new Error(`Error al procesar el retiro: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Rechazar retiro
  static async rechazarRetiro(id: number): Promise<SupabaseRetiro> {
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

  // Aprobar múltiples retiros (con validación de saldo y procesamiento de fondos)
  static async aprobarRetiros(ids: number[]): Promise<SupabaseRetiro[]> {
    // Validar cada retiro antes de aprobar
    const retirosValidados: number[] = []
    const errores: string[] = []

    for (const id of ids) {
      try {
        const retiroWithUser = await this.getRetiroById(id)
        if (!retiroWithUser) {
          errores.push(`Retiro ${id}: No encontrado`)
          continue
        }

        // Obtener saldo de la billetera del usuario
        if (!retiroWithUser.usuarios?.billetera_id) {
          errores.push(`Retiro ${id}: Usuario no tiene billetera asociada`)
          continue
        }

        const { data: billetera, error: billeteraError } = await supabase
          .from('billeteras')
          .select('saldo')
          .eq('id', retiroWithUser.usuarios.billetera_id)
          .single()

        if (billeteraError || !billetera) {
          errores.push(`Retiro ${id}: Error al obtener información de la billetera`)
          continue
        }

        const saldoBilletera = billetera.saldo || 0
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

    // Procesar cada retiro individualmente para manejar fondos y comisiones
    const retirosAprobados: SupabaseRetiro[] = []
    const erroresProcesamiento: string[] = []

    for (const retiroId of retirosValidados) {
      try {
        // 1. Procesar la transferencia de fondos y comisión
        await procesarRetiroAprobado(retiroId)
        
        // 2. Cambiar el estado a aprobado
        const retiroActualizado = await this.updateRetiro(retiroId, { estado: 'aprobado' })
        retirosAprobados.push(retiroActualizado)
      } catch (error) {
        console.error(`Error procesando retiro ${retiroId}:`, error)
        erroresProcesamiento.push(`Retiro ${retiroId}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      }
    }

    // Si hubo errores de procesamiento, informar cuáles se aprobaron y cuáles fallaron
    if (erroresProcesamiento.length > 0) {
      const mensaje = `Se aprobaron ${retirosAprobados.length} de ${retirosValidados.length} retiros. Errores:\n${erroresProcesamiento.join('\n')}`
      
      if (retirosAprobados.length === 0) {
        throw new Error(mensaje)
      } else {
        console.warn(mensaje)
        // Continuar con los retiros que sí se procesaron correctamente
      }
    }

    return retirosAprobados
  }

  // Rechazar múltiples retiros
  static async rechazarRetiros(ids: number[]): Promise<SupabaseRetiro[]> {
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
