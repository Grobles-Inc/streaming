import { supabase } from '@/lib/supabase'
import type { 
  ComisionPublicacion,
  ComisionRetiro,
  EstadisticasComisiones
} from '../data/types'

export class MiBilleteraService {
  // Obtener comisiones por publicación para un admin específico
  static async getComisionesPublicacion(adminId: string): Promise<ComisionPublicacion[]> {
    try {
      // Obtener productos publicados
      const { data: productos, error: productosError } = await supabase
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

      if (productosError) throw productosError

      // Obtener configuración de comisiones
      const { data: configuraciones, error: configError } = await supabase
        .from('configuracion')
        .select('comision_publicacion_producto, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) throw configError

      // Calcular comisiones de publicación
      const comisiones: ComisionPublicacion[] = productos?.map((producto) => {
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= new Date(producto.updated_at)
        ) || configuraciones?.[configuraciones.length - 1]

        const comisionEnDolares = configVigente?.comision_publicacion_producto || 0
        const porcentajeComision = producto.precio_publico > 0 ? (comisionEnDolares / producto.precio_publico) * 100 : 0
        const usuarioData = Array.isArray(producto.usuarios) ? producto.usuarios[0] : producto.usuarios

        return {
          id: `pub_${producto.id}`,
          producto_id: producto.id,
          proveedor_id: producto.proveedor_id,
          admin_id: adminId,
          monto_comision: comisionEnDolares,
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
      throw error
    }
  }

  // Obtener comisiones por retiro para un admin específico
  static async getComisionesRetiro(adminId: string): Promise<ComisionRetiro[]> {
    try {
      // Obtener retiros aprobados
      const { data: retiros, error: retirosError } = await supabase
        .from('retiros')
        .select(`
          id,
          usuario_id,
          monto,
          estado,
          created_at,
          updated_at,
          usuarios:usuario_id (
            nombres,
            apellidos,
            usuario
          )
        `)
        .eq('estado', 'aprobado') // Solo retiros aprobados generan comisión
        .order('updated_at', { ascending: false })

      if (retirosError) throw retirosError

      // Obtener configuración de comisiones de retiro
      // Manejo temporal para cuando la columna comision_retiro no existe aún
      let configuraciones: any[] = []
      const { data: configData, error: configError } = await supabase
        .from('configuracion')
        .select('comision_retiro, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) {
        // Si el error es que la columna no existe, usar valor por defecto
        if (configError.code === '42703' && configError.message.includes('comision_retiro')) {
          console.warn('Campo comision_retiro no existe aún. Usando valor por defecto 2.5%')
          configuraciones = [{ comision_retiro: 2.5, updated_at: new Date().toISOString() }]
        } else {
          throw configError
        }
      } else {
        configuraciones = configData || []
      }

      // Calcular comisiones de retiro
      const comisiones: ComisionRetiro[] = retiros?.map((retiro) => {
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= new Date(retiro.updated_at)
        ) || configuraciones?.[configuraciones.length - 1]

        const comisionPorcentaje = configVigente?.comision_retiro || 2.5 // Valor por defecto temporal
        const comisionEnDolares = (retiro.monto * comisionPorcentaje) / 100
        const usuarioData = Array.isArray(retiro.usuarios) ? retiro.usuarios[0] : retiro.usuarios

        return {
          id: `ret_${retiro.id}`,
          retiro_id: retiro.id,
          usuario_id: retiro.usuario_id,
          admin_id: adminId,
          monto_retiro: retiro.monto,
          monto_comision: comisionEnDolares,
          porcentaje_comision: comisionPorcentaje,
          fecha_retiro: retiro.updated_at,
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
      throw error
    }
  }

  // Obtener tasa de conversión actual
  static async getConversion(): Promise<number> {
    try {
      const { data: configData } = await supabase
        .from('configuracion')
        .select('conversion')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      return configData?.conversion || 3.75
    } catch (error) {
      console.error('Error al obtener tasa de conversión:', error)
      return 3.75 // Valor por defecto
    }
  }

  // Calcular estadísticas de comisiones
  static async getEstadisticasComisiones(adminId: string): Promise<EstadisticasComisiones> {
    try {
      const [comisionesPublicacion, comisionesRetiro] = await Promise.all([
        this.getComisionesPublicacion(adminId),
        this.getComisionesRetiro(adminId)
      ])

      const totalComisionesPublicacion = comisionesPublicacion.reduce((sum, c) => sum + c.monto_comision, 0)
      const totalComisionesRetiro = comisionesRetiro.reduce((sum, c) => sum + c.monto_comision, 0)
      const totalComisiones = totalComisionesPublicacion + totalComisionesRetiro
      const cantidadPublicaciones = comisionesPublicacion.length
      const cantidadRetiros = comisionesRetiro.length
      const promedioComisionPublicacion = cantidadPublicaciones > 0 ? totalComisionesPublicacion / cantidadPublicaciones : 0
      const promedioComisionRetiro = cantidadRetiros > 0 ? totalComisionesRetiro / cantidadRetiros : 0

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
      console.error('Error al calcular estadísticas de comisiones:', error)
      throw error
    }
  }
}
