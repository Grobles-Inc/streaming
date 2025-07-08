import { supabase } from '@/lib/supabase'
import type { 
  ComisionPublicacion, 
  ComisionRetiro, 
  ComisionGeneral, 
  FiltrosComisiones,
  EstadisticasComisiones 
} from '../data/types'

export class ComisionesService {
  
  /**
   * Obtiene las comisiones por publicación de productos
   */
  static async getComisionesPublicacion(
    adminId: string, 
    filtros?: FiltrosComisiones
  ): Promise<ComisionPublicacion[]> {
    try {
      let query = supabase
        .from('productos')
        .select(`
          id,
          nombre,
          precio_publico,
          estado,
          proveedor_id,
          updated_at,
          usuarios:proveedor_id (
            nombres,
            apellidos,
            usuario
          )
        `)
        .eq('estado', 'publicado')
        .order('updated_at', { ascending: false })

      if (filtros?.fechaInicio) {
        query = query.gte('updated_at', filtros.fechaInicio)
      }
      
      if (filtros?.fechaFin) {
        query = query.lte('updated_at', filtros.fechaFin)
      }

      if (filtros?.producto) {
        query = query.ilike('nombre', `%${filtros.producto}%`)
      }

      const { data: productos, error } = await query

      if (error) throw error

      // Obtener configuración actual y por fecha
      const { data: configuraciones, error: configError } = await supabase
        .from('configuracion')
        .select('comision_publicacion_producto, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) throw configError

      // Calcular comisiones basadas en la configuración vigente al momento de publicación
      const comisiones: ComisionPublicacion[] = productos?.map((producto) => {
        // Encontrar la configuración vigente al momento de la publicación
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= new Date(producto.updated_at)
        ) || configuraciones?.[configuraciones.length - 1]

        // La comision_publicacion_producto debe ser el monto en dólares, no porcentaje
        const montoComisionEnDolares = configVigente?.comision_publicacion_producto || 0
        // Calcular el porcentaje para referencia (opcional)
        const porcentajeComision = producto.precio_publico > 0 ? (montoComisionEnDolares / producto.precio_publico) * 100 : 0
        const usuarioData = Array.isArray(producto.usuarios) ? producto.usuarios[0] : producto.usuarios

        return {
          id: `pub_${producto.id}`,
          producto_id: producto.id,
          proveedor_id: producto.proveedor_id,
          admin_id: adminId,
          monto_comision: montoComisionEnDolares,
          porcentaje_comision: porcentajeComision,
          fecha_publicacion: producto.updated_at,
          producto: {
            nombre: producto.nombre,
            precio_publico: producto.precio_publico,
            estado: producto.estado
          },
          proveedor: {
            nombres: usuarioData?.nombres || '',
            apellidos: usuarioData?.apellidos || '',
            usuario: usuarioData?.usuario || ''
          },
          created_at: producto.updated_at
        }
      }) || []

      return comisiones
    } catch (error) {
      console.error('Error al obtener comisiones de publicación:', error)
      throw new Error('Error al cargar las comisiones de publicación')
    }
  }

  /**
   * Obtiene las comisiones por retiros
   */
  static async getComisionesRetiro(
    adminId: string, 
    filtros?: FiltrosComisiones
  ): Promise<ComisionRetiro[]> {
    try {
      let query = supabase
        .from('retiros')
        .select(`
          id,
          usuario_id,
          monto,
          estado,
          created_at,
          usuarios:usuario_id (
            nombres,
            apellidos,
            usuario,
            rol
          )
        `)
        .neq('usuarios.rol', 'admin') // Excluir retiros del admin
        .eq('estado', 'aprobado')
        .order('created_at', { ascending: false })

      if (filtros?.fechaInicio) {
        query = query.gte('created_at', filtros.fechaInicio)
      }
      
      if (filtros?.fechaFin) {
        query = query.lte('created_at', filtros.fechaFin)
      }

      const { data: retiros, error } = await query

      if (error) throw error

      // Obtener configuración de comisión por fecha
      const { data: configuraciones, error: configError } = await supabase
        .from('configuracion')
        .select('comision, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) throw configError

      // Calcular comisiones basadas en la configuración vigente al momento del retiro
      const comisiones: ComisionRetiro[] = retiros?.map((retiro) => {
        // Encontrar la configuración vigente al momento del retiro
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= new Date(retiro.created_at)
        ) || configuraciones?.[configuraciones.length - 1]

        const porcentajeComision = configVigente?.comision || 0
        const montoComision = (retiro.monto * porcentajeComision) / 100
        const usuarioData = Array.isArray(retiro.usuarios) ? retiro.usuarios[0] : retiro.usuarios

        return {
          id: `ret_${retiro.id}`,
          retiro_id: retiro.id,
          usuario_id: retiro.usuario_id,
          admin_id: adminId,
          monto_retiro: retiro.monto,
          monto_comision: montoComision,
          porcentaje_comision: porcentajeComision,
          fecha_retiro: retiro.created_at,
          usuario: {
            nombres: usuarioData?.nombres || '',
            apellidos: usuarioData?.apellidos || '',
            usuario: usuarioData?.usuario || ''
          },
          created_at: retiro.created_at
        }
      }) || []

      return comisiones
    } catch (error) {
      console.error('Error al obtener comisiones de retiro:', error)
      throw new Error('Error al cargar las comisiones de retiro')
    }
  }

  /**
   * Obtiene todas las comisiones combinadas
   */
  static async getComisionesGenerales(
    adminId: string, 
    filtros?: FiltrosComisiones
  ): Promise<ComisionGeneral[]> {
    try {
      const [comisionesPublicacion, comisionesRetiro] = await Promise.all([
        this.getComisionesPublicacion(adminId, filtros?.tipo === 'retiro' ? undefined : filtros),
        this.getComisionesRetiro(adminId, filtros?.tipo === 'publicacion' ? undefined : filtros)
      ])

      const comisionesGenerales: ComisionGeneral[] = []

      // Agregar comisiones de publicación
      if (filtros?.tipo !== 'retiro') {
        comisionesPublicacion.forEach(comision => {
          comisionesGenerales.push({
            id: comision.id,
            tipo: 'publicacion',
            usuario_id: comision.proveedor_id,
            monto_base: comision.producto.precio_publico,
            monto_comision: comision.monto_comision,
            porcentaje_comision: comision.porcentaje_comision,
            fecha_transaccion: comision.fecha_publicacion,
            descripcion: `Comisión por publicación del producto: ${comision.producto.nombre}`,
            usuario: {
              nombres: comision.proveedor.nombres,
              apellidos: comision.proveedor.apellidos,
              usuario: comision.proveedor.usuario
            },
            producto: {
              nombre: comision.producto.nombre
            },
            created_at: comision.created_at
          })
        })
      }

      // Agregar comisiones de retiro
      if (filtros?.tipo !== 'publicacion') {
        comisionesRetiro.forEach(comision => {
          comisionesGenerales.push({
            id: comision.id,
            tipo: 'retiro',
            usuario_id: comision.usuario_id,
            monto_base: comision.monto_retiro,
            monto_comision: comision.monto_comision,
            porcentaje_comision: comision.porcentaje_comision,
            fecha_transaccion: comision.fecha_retiro,
            descripcion: `Comisión por retiro de $${comision.monto_retiro.toFixed(2)}`,
            usuario: {
              nombres: comision.usuario.nombres,
              apellidos: comision.usuario.apellidos,
              usuario: comision.usuario.usuario
            },
            created_at: comision.created_at
          })
        })
      }

      // Ordenar por fecha más reciente
      return comisionesGenerales.sort((a, b) => 
        new Date(b.fecha_transaccion).getTime() - new Date(a.fecha_transaccion).getTime()
      )
    } catch (error) {
      console.error('Error al obtener comisiones generales:', error)
      throw new Error('Error al cargar las comisiones')
    }
  }

  /**
   * Obtiene estadísticas de comisiones
   */
  static async getEstadisticasComisiones(
    adminId: string, 
    filtros?: FiltrosComisiones
  ): Promise<EstadisticasComisiones> {
    try {
      const [comisionesPublicacion, comisionesRetiro] = await Promise.all([
        this.getComisionesPublicacion(adminId, filtros),
        this.getComisionesRetiro(adminId, filtros)
      ])

      const totalComisionesPublicacion = comisionesPublicacion.reduce(
        (total, comision) => total + comision.monto_comision, 0
      )

      const totalComisionesRetiro = comisionesRetiro.reduce(
        (total, comision) => total + comision.monto_comision, 0
      )

      const totalComisiones = totalComisionesPublicacion + totalComisionesRetiro

      const cantidadPublicaciones = comisionesPublicacion.length
      const cantidadRetiros = comisionesRetiro.length

      const promedioComisionPublicacion = cantidadPublicaciones > 0 
        ? totalComisionesPublicacion / cantidadPublicaciones 
        : 0

      const promedioComisionRetiro = cantidadRetiros > 0 
        ? totalComisionesRetiro / cantidadRetiros 
        : 0

      return {
        totalComisionesPublicacion,
        totalComisionesRetiro,
        totalComisiones,
        cantidadPublicaciones,
        cantidadRetiros,
        promedioComisionPublicacion,
        promedioComisionRetiro
      }
    } catch (error) {
      console.error('Error al obtener estadísticas de comisiones:', error)
      throw new Error('Error al cargar las estadísticas')
    }
  }
}
