import { z } from 'zod'
import type { RecargaWithUser } from './types'

// Esquema para estado de recarga
const estadoRecargaSchema = z.union([
  z.literal('aprobado'),
  z.literal('pendiente'),
  z.literal('rechazado'),
])
export type EstadoRecarga = z.infer<typeof estadoRecargaSchema>

// Esquema para recarga mapeada
const mappedRecargaSchema = z.object({
  id: z.number(),  // Cambiado de string a number
  usuarioId: z.string().nullable(),
  usuario: z.string(),
  usuarioNombre: z.string(),
  usuarioNombres: z.string(),
  usuarioApellidos: z.string(),
  usuarioTelefono: z.string().nullable(),
  monto: z.number(),
  montoSoles: z.number(),
  estado: estadoRecargaSchema,
  fechaCreacion: z.date(),
  fechaActualizacion: z.date(),
  montoFormateado: z.string(),
  montoSolesFormateado: z.string(),
  puedeModificar: z.boolean(),
})

// Esquema para filtros
const filtroRecargaSchema = z.object({
  estado: estadoRecargaSchema.optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  usuarioId: z.string().optional(),
})

// Tipos exportados
export type MappedRecarga = z.infer<typeof mappedRecargaSchema>
export type FiltroRecarga = z.infer<typeof filtroRecargaSchema>

// Función para mapear recarga de Supabase a componente
export function mapSupabaseRecargaToComponent(recarga: RecargaWithUser): MappedRecarga {
  const nombreCompleto = recarga.usuario?.usuario || 'Usuario no encontrado'
  
  const montoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(recarga.monto)

  // Fallback a la tasa por defecto del sistema cuando no se busca configuración
  const tasaConversion = 3.7
  const montoSoles = (recarga.monto || 0) * tasaConversion
  const montoSolesFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(montoSoles)

  return {
    id: recarga.id,  // Ahora es number
    usuarioId: recarga.usuario_id,
    usuario: recarga.usuario?.usuario || '',
    usuarioNombre: nombreCompleto,
    usuarioNombres: recarga.usuario?.nombres || '',
    usuarioApellidos: recarga.usuario?.apellidos || '',
    usuarioTelefono: recarga.usuario?.telefono || null,
    monto: recarga.monto,
    montoSoles,
    estado: recarga.estado ?? 'pendiente',
    fechaCreacion: new Date(recarga.created_at),
    fechaActualizacion: new Date(recarga.updated_at ?? recarga.created_at),
    montoFormateado,
    montoSolesFormateado,
    puedeModificar: recarga.estado === 'pendiente',
  }
}

// Validadores
export { estadoRecargaSchema, filtroRecargaSchema }
