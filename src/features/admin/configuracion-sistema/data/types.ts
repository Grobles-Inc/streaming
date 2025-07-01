import { Database } from '@/types/supabase'

// Tipo base de configuración desde Supabase (para referencia directa)
export type ConfiguracionRow = Database['public']['Tables']['configuracion']['Row']

// Tipo para crear una nueva configuración
export type CreateConfiguracionData = Database['public']['Tables']['configuracion']['Insert']

// Tipo para actualizar configuración
export type UpdateConfiguracionData = Database['public']['Tables']['configuracion']['Update']

// Configuración mapeada para el componente (mantiene nombres consistentes con Supabase)
export type MappedConfiguracion = {
  id: string
  mantenimiento: boolean
  comision: number
  email_soporte: string | null
  conversion: number
  comision_publicacion_producto: number
  createdAt: Date
  updatedAt: Date
}

// Entrada del historial de configuraciones
export type HistorialConfiguracion = MappedConfiguracion & {
  fechaCambio: Date // Alias para updatedAt en el contexto del historial
}
