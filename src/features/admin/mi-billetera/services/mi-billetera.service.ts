import { supabase } from '@/lib/supabase'
import type { 
  ComisionPublicacion,
  ComisionRetiro,
  EstadisticasComisiones
} from '../data/types'

export class MiBilleteraService {
  /**
   * Obtiene comisiones por publicación para un admin específico.
   * 
   * IMPORTANTE: Las comisiones se calculan usando la tasa vigente en el momento de la publicación,
   * no la tasa actual. Esto se logra comparando el updated_at del producto con el updated_at 
   * de las configuraciones para encontrar qué comisión estaba activa en ese momento.
   * 
   * Ejemplo:
   * - Producto publicado el 1 de enero con comisión de $3.50
   * - Comisión cambió a $4.00 el 15 de enero
   * - Este producto siempre mostrará $3.50 como comisión, no $4.00
   * 
   * @param adminId ID del administrador
   * @returns Array de comisiones de publicación con comisiones históricas
   */
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

      /* 
       * LÓGICA CORREGIDA:
       * 
       * Para encontrar la configuración vigente, necesitamos:
       * 1. Todas las configuraciones ordenadas por fecha (más reciente primero)
       * 2. Buscar la PRIMERA configuración cuya fecha sea MENOR O IGUAL a la fecha del producto
       * 
       * Ejemplo:
       * Configuraciones: [2024-07-13: $4, 2024-06-30: $3.5, 2024-06-01: $3]
       * - Producto del 2024-07-15 -> Usa $4 (config del 2024-07-13)
       * - Producto del 2024-07-13 -> Usa $4 (config del 2024-07-13, misma fecha)
       * - Producto del 2024-07-05 -> Usa $3.5 (config del 2024-06-30)
       * - Producto del 2024-05-15 -> Usa $3 (config del 2024-06-01, la más antigua)
       */

      // Calcular comisiones de publicación
      const comisiones: ComisionPublicacion[] = productos?.map((producto) => {
        const fechaProducto = new Date(producto.updated_at)
        
        // Buscar la configuración vigente para esta fecha
        // Necesitamos la configuración MÁS RECIENTE que sea anterior o igual a la fecha del producto
        let configVigente = null
        let fechaMasReciente: Date | null = null
        
        // Recorrer todas las configuraciones
        for (const config of configuraciones || []) {
          const fechaConfig = new Date(config.updated_at)
          
          // Si la configuración es anterior o igual a la fecha del producto
          if (fechaConfig <= fechaProducto) {
            // Si es la primera que encontramos, o si es más reciente que la anterior
            if (!configVigente || !fechaMasReciente || fechaConfig > fechaMasReciente) {
              configVigente = config
              fechaMasReciente = fechaConfig
            }
          }
        }
        
        // Si no encontramos ninguna anterior, el producto es muy antiguo, usar la más vieja
        if (!configVigente && configuraciones && configuraciones.length > 0) {
          configVigente = configuraciones[configuraciones.length - 1]
        }

        // Debug temporal - para verificar la corrección
        console.log(`🔧 CORREGIDO - Producto: ${producto.nombre}`, {
          fechaProducto: fechaProducto.toLocaleDateString('es-PE') + ' ' + fechaProducto.toLocaleTimeString('es-PE'),
          configUsada: configVigente ? {
            fecha: new Date(configVigente.updated_at).toLocaleDateString('es-PE') + ' ' + new Date(configVigente.updated_at).toLocaleTimeString('es-PE'),
            comision: `$${configVigente.comision_publicacion_producto}`
          } : 'No encontrada',
          configuracionesDisponibles: configuraciones?.map(c => ({
            fecha: new Date(c.updated_at).toLocaleDateString('es-PE') + ' ' + new Date(c.updated_at).toLocaleTimeString('es-PE'),
            comision: `$${c.comision_publicacion_producto}`,
            esAnterior: new Date(c.updated_at) <= fechaProducto
          }))
        })

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

  /**
   * Obtiene comisiones por retiro para un admin específico.
   * 
   * IMPORTANTE: Las comisiones se calculan usando la tasa vigente en el momento del retiro,
   * no la tasa actual. Esto se logra comparando el updated_at del retiro con el updated_at 
   * de las configuraciones para encontrar qué comisión estaba activa en ese momento.
   * 
   * @param adminId ID del administrador
   * @returns Array de comisiones de retiro con comisiones históricas
   */
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
      let configuraciones = []
      const { data: configData, error: configError } = await supabase
        .from('configuracion')
        .select('comision_retiro, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) {
        // Si el error es que la columna no existe, usar valor por defecto
        if (configError.code === '42703' && configError.message.includes('comision_retiro')) {
          console.warn('Campo comision_retiro no existe aún. Usando valor por defecto 10%')
          configuraciones = [{ comision_retiro: 10, updated_at: new Date().toISOString() }]
        } else {
          throw configError
        }
      } else {
        configuraciones = configData || []
      }

      // Calcular comisiones de retiro
      const comisiones: ComisionRetiro[] = retiros?.map((retiro) => {
        const fechaRetiro = new Date(retiro.updated_at)
        
        // Buscar la configuración vigente para esta fecha
        // Necesitamos la configuración MÁS RECIENTE que sea anterior o igual a la fecha del retiro
        let configVigente = null
        let fechaMasReciente: Date | null = null
        
        for (const config of configuraciones || []) {
          const fechaConfig = new Date(config.updated_at)
          
          // Si la configuración es anterior o igual a la fecha del retiro
          if (fechaConfig <= fechaRetiro) {
            // Si es la primera que encontramos, o si es más reciente que la anterior
            if (!configVigente || !fechaMasReciente || fechaConfig > fechaMasReciente) {
              configVigente = config
              fechaMasReciente = fechaConfig
            }
          }
        }
        
        // Si no encontramos ninguna anterior, usar la más vieja
        if (!configVigente && configuraciones && configuraciones.length > 0) {
          configVigente = configuraciones[configuraciones.length - 1]
        }

        const comisionPorcentaje = configVigente?.comision_retiro || 10 // Valor por defecto temporal
        const comisionEnDolares = ((retiro.monto * 100)/90 * comisionPorcentaje) / 100
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
