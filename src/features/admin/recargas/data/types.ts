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
    usuario: string
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

// Parámetros del RPC `get_recargas_admin`
export type GetRecargasAdminParams = {
  search: string
  estado: EstadoRecarga | null
  page: number
  pageSize: number
}

// Fila cruda del RPC: igual a `MappedRecarga` pero con las fechas como ISO string
// (jsonb serializa los `timestamptz` a ISO 8601)
export type RecargaAdminRow = Omit<
  MappedRecarga,
  'fechaCreacion' | 'fechaActualizacion'
> & {
  fechaCreacion: string
  fechaActualizacion: string
}

// Respuesta jsonb completa del RPC
export type GetRecargasAdminResponse = {
  data: RecargaAdminRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalPendientes: number
}

// Resultado del listado ya mapeado para la tabla
// (`fechaCreacion`/`fechaActualizacion` como `Date`)
export type RecargasPaginadas = {
  recargas: MappedRecarga[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalPendientes: number
}

// Recarga mapeada para el componente
export type MappedRecarga = {
  id: number  // Cambiado de string a number
  usuarioId: string
  usuario: string          // Nuevo campo: username del usuario
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
