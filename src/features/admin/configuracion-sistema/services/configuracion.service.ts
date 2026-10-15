import { supabase } from '@/lib/supabase'
import {
  asBinanceInfo,
  asYapeInfo,
  binanceInfoToJson,
  yapeInfoToJson,
} from '@/lib/recarga-info'

import type { ConfiguracionRow, MappedConfiguracion, HistorialConfiguracion } from '../data/types'

export class ConfiguracionService {
  /**
   * Obtiene la configuración más reciente del sistema
   */
  static async getLatestConfiguracion(): Promise<MappedConfiguracion | null> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching latest configuration:', error)
      return null
    }

    return this.mapConfiguracionRow(data)
  }

  /**
   * Obtiene el historial completo de configuraciones
   */
  static async getHistorialConfiguracion(): Promise<HistorialConfiguracion[]> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching configuration history:', error)
      return []
    }

    return data.map((row) => {
      const mapped = this.mapConfiguracionRow(row)
      return { ...mapped, fechaCambio: mapped.updatedAt }
    })
  }

  /**
   * Guarda una nueva configuración (crea una nueva fila para mantener historial)
   */
  static async saveConfiguracion(config: Omit<MappedConfiguracion, 'id' | 'createdAt' | 'updatedAt'>): Promise<MappedConfiguracion | null> {
    const { data, error } = await supabase
      .from('configuracion')
      .insert({
        mantenimiento: config.mantenimiento,
        email_soporte: config.email_soporte,
        comision: config.comision,
        conversion: config.conversion,
        comision_publicacion_producto: config.comision_publicacion_producto,
        yape_info: config.yape_info ? yapeInfoToJson(config.yape_info) : null,
        binance_info: config.binance_info
          ? binanceInfoToJson(config.binance_info)
          : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving configuration:', error)
      throw new Error('Error al guardar la configuración')
    }

    return this.mapConfiguracionRow(data)
  }

  /**
   * Obtiene una configuración específica por ID (para restaurar del historial)
   */
  static async getConfiguracionById(id: number): Promise<MappedConfiguracion | null> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching configuration by ID:', error)
      return null
    }

    return this.mapConfiguracionRow(data)
  }

  /**
   * Restaura una configuración del historial (crea una nueva fila con los valores anteriores)
   */
  static async restaurarConfiguracion(id: number): Promise<MappedConfiguracion | null> {
    const configAnterior = await this.getConfiguracionById(id)
    
    if (!configAnterior) {
      throw new Error('Configuración no encontrada')
    }

    return this.saveConfiguracion({
      mantenimiento: configAnterior.mantenimiento,
      email_soporte: configAnterior.email_soporte,
      comision: configAnterior.comision,
      conversion: configAnterior.conversion,
      comision_publicacion_producto: configAnterior.comision_publicacion_producto,
      yape_info: configAnterior.yape_info,
      binance_info: configAnterior.binance_info
    })
  }

  /**
   * Mapea una fila de la base de datos a la estructura de configuración
   */
  private static mapConfiguracionRow(row: ConfiguracionRow): MappedConfiguracion {
    // `updated_at` es la única fecha de la tabla y es nullable en la BD.
    const updatedAt = row.updated_at ? new Date(row.updated_at) : new Date()
    return {
      id: row.id,
      mantenimiento: row.mantenimiento ?? false,
      email_soporte: row.email_soporte,
      comision: row.comision ?? 0,
      conversion: row.conversion ?? 1,
      comision_publicacion_producto: row.comision_publicacion_producto,
      yape_info: row.yape_info ? asYapeInfo(row.yape_info) : null,
      binance_info: row.binance_info ? asBinanceInfo(row.binance_info) : null,
      createdAt: updatedAt, // Usamos updated_at como fecha de creación
      updatedAt
    }
  }

  /**
   * Obtiene configuración por defecto si no existe ninguna
   */
  static getDefaultConfiguracion(): MappedConfiguracion {
    return {
      id: 0,
      mantenimiento: false,
      email_soporte: 'soporte@streaming.com',
      comision: 10,
      conversion: 1,
      comision_publicacion_producto: 1.35,
      yape_info: null,
      binance_info: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}
