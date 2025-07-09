import { Database } from '@/types/supabase'

// Tipo base de retiro desde Supabase
export type SupabaseRetiro = Database['public']['Tables']['retiros']['Row']

// Tipo para crear un nuevo retiro
export type CreateRetiroData = Database['public']['Tables']['retiros']['Insert']

// Tipo para actualizar un retiro
export type UpdateRetiroData = Database['public']['Tables']['retiros']['Update']

// Tipo de retiro con información del usuario (estructura real de Supabase)
export type RetiroWithUser = SupabaseRetiro & {
  usuarios?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
    billetera_id: string
  }
}

// Estados de retiro (según Supabase schema)
export type EstadoRetiro = 'aprobado' | 'pendiente' | 'rechazado'

// Filtros para retiros
export type FiltroRetiro = {
  estado?: EstadoRetiro
  fechaDesde?: string
  fechaHasta?: string
  usuarioId?: string
}

// Estadísticas de retiros
export type EstadisticasRetiros = {
  total: number
  aprobadas: number
  pendientes: number
  rechazadas: number
  montoTotal: number
  montoAprobado: number
  montoPendiente: number
  montoRechazado: number
}

// Retiro mapeado para el componente
export type MappedRetiro = {
  id: number
  usuarioId: string
  usuarioNombre: string
  usuarioNombres: string
  usuarioApellidos: string
  usuarioTelefono: string | null
  saldoBilletera: number
  billeteraId: string | null
  monto: number
  estado: EstadoRetiro
  fechaCreacion: Date
  fechaActualizacion: Date
  // Datos adicionales para la UI
  montoFormateado: string
  saldoFormateado: string
  puedeModificar: boolean
  puedeAprobar: boolean // True si el saldo es suficiente
}
