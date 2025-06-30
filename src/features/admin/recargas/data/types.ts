import { Database } from '@/types/supabase'

// Tipo base de recarga desde Supabase
export type SupabaseRecarga = Database['public']['Tables']['recargas']['Row']

// Tipo para crear una nueva recarga
export type CreateRecargaData = Database['public']['Tables']['recargas']['Insert']

// Tipo para actualizar una recarga
export type UpdateRecargaData = Database['public']['Tables']['recargas']['Update']

// Tipo de recarga con información del usuario
export type RecargaWithUser = SupabaseRecarga & {
  usuario?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
  }
}

// Estados de recarga (según Supabase schema)
export type EstadoRecarga = 'aprobado' | 'pendiente' | 'rechazado'

// Filtros para recargas
export type FiltroRecarga = {
  estado?: EstadoRecarga
  fechaDesde?: string
  fechaHasta?: string
  usuarioId?: string
}

// Estadísticas de recargas
export type EstadisticasRecargas = {
  total: number
  aprobadas: number
  pendientes: number
  rechazadas: number
  montoTotal: number
  montoAprobado: number
  montoPendiente: number
  montoRechazado: number
}

// Recarga mapeada para el componente
export type MappedRecarga = {
  id: string
  usuarioId: string
  usuarioNombre: string
  usuarioNombres: string
  usuarioApellidos: string
  usuarioTelefono: string | null
  monto: number
  estado: EstadoRecarga
  fechaCreacion: Date
  fechaActualizacion: Date
  // Datos adicionales para la UI
  montoFormateado: string
  puedeModificar: boolean
}
