import { supabase } from '@/lib/supabase'
import type { Billetera, Recarga, Retiro, RecargaFormData, RetiroFormData } from '../data/types'

export class BilleterasService {
  // Obtener todas las billeteras con información de usuarios
  static async getBilleteras(): Promise<Billetera[]> {
    const { data, error } = await supabase
      .from('billeteras')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener billeteras:', error)
      throw error
    }

    return data || []
  }

  // Obtener billetera por usuario ID
  static async getBilleteraByUsuario(usuarioId: string): Promise<Billetera | null> {
    const { data, error } = await supabase
      .from('billeteras')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .eq('usuario_id', usuarioId)
      .single()

    if (error) {
      console.error('Error al obtener billetera:', error)
      throw error
    }

    return data
  }

  // Obtener todas las recargas
  static async getRecargas(): Promise<Recarga[]> {
    const { data, error } = await supabase
      .from('recargas')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener recargas:', error)
      throw error
    }

    return data || []
  }

  // Obtener recargas por usuario
  static async getRecargasByUsuario(usuarioId: string): Promise<Recarga[]> {
    const { data, error } = await supabase
      .from('recargas')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener recargas del usuario:', error)
      throw error
    }

    return data || []
  }

  // Obtener todos los retiros
  static async getRetiros(): Promise<Retiro[]> {
    const { data, error } = await supabase
      .from('retiros')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener retiros:', error)
      throw error
    }

    return data || []
  }

  // Obtener retiros por usuario
  static async getRetirosByUsuario(usuarioId: string): Promise<Retiro[]> {
    const { data, error } = await supabase
      .from('retiros')
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error al obtener retiros del usuario:', error)
      throw error
    }

    return data || []
  }

  // Crear nueva recarga
  static async createRecarga(data: RecargaFormData): Promise<Recarga> {
    const { data: recarga, error } = await supabase
      .from('recargas')
      .insert([{
        usuario_id: data.usuario_id,
        monto: data.monto,
        estado: 'pendiente'
      }])
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .single()

    if (error) {
      console.error('Error al crear recarga:', error)
      throw error
    }

    return recarga
  }

  // Crear nuevo retiro
  static async createRetiro(data: RetiroFormData): Promise<Retiro> {
    const { data: retiro, error } = await supabase
      .from('retiros')
      .insert([{
        usuario_id: data.usuario_id,
        monto: data.monto,
        estado: 'pendiente'
      }])
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .single()

    if (error) {
      console.error('Error al crear retiro:', error)
      throw error
    }

    return retiro
  }

  // Actualizar estado de recarga
  static async updateRecargaEstado(recargaId: number, estado: 'aprobado' | 'pendiente' | 'rechazado'): Promise<Recarga> {
    const { data, error } = await supabase
      .from('recargas')
      .update({ estado })
      .eq('id', recargaId)
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .single()

    if (error) {
      console.error('Error al actualizar recarga:', error)
      throw error
    }

    return data
  }

  // Actualizar estado de retiro
  static async updateRetiroEstado(retiroId: number, estado: 'aprobado' | 'pendiente' | 'rechazado'): Promise<Retiro> {
    const { data, error } = await supabase
      .from('retiros')
      .update({ estado })
      .eq('id', retiroId)
      .select(`
        *,
        usuario:usuarios!usuario_id(
          id,
          nombres,
          apellidos,
          email,
          telefono,
          rol
        )
      `)
      .single()

    if (error) {
      console.error('Error al actualizar retiro:', error)
      throw error
    }

    return data
  }

  // Obtener usuarios para selección
  static async getUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos, email, rol')
      .order('nombres', { ascending: true })

    if (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }

    return data || []
  }
}
