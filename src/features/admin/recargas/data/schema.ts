import { z } from 'zod'

// Esquema para estado de recarga
const estadoRecargaSchema = z.union([
  z.literal('aprobado'),
  z.literal('pendiente'),
  z.literal('rechazado'),
])
export type EstadoRecarga = z.infer<typeof estadoRecargaSchema>

// Esquema para recarga base
const recargaBaseSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  monto: z.number().min(0),
  estado: estadoRecargaSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

// Esquema para recarga con usuario
const recargaWithUserSchema = recargaBaseSchema.extend({
  usuario: z.object({
    id: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    telefono: z.string().nullable(),
  }).optional(),
})

// Esquema para recarga mapeada
const mappedRecargaSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  usuarioNombre: z.string(),
  usuarioNombres: z.string(),
  usuarioApellidos: z.string(),
  usuarioTelefono: z.string().nullable(),
  monto: z.number(),
  estado: estadoRecargaSchema,
  fechaCreacion: z.date(),
  fechaActualizacion: z.date(),
  montoFormateado: z.string(),
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
export type RecargaBase = z.infer<typeof recargaBaseSchema>
export type RecargaWithUser = z.infer<typeof recargaWithUserSchema>
export type MappedRecarga = z.infer<typeof mappedRecargaSchema>
export type FiltroRecarga = z.infer<typeof filtroRecargaSchema>

// Función para mapear recarga de Supabase a componente
export function mapSupabaseRecargaToComponent(recarga: RecargaWithUser): MappedRecarga {
  const nombreCompleto = recarga.usuario 
    ? `${recarga.usuario.nombres} ${recarga.usuario.apellidos}`.trim()
    : 'Usuario no encontrado'
  
  const montoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(recarga.monto)

  return {
    id: recarga.id,
    usuarioId: recarga.usuario_id,
    usuarioNombre: nombreCompleto,
    usuarioNombres: recarga.usuario?.nombres || '',
    usuarioApellidos: recarga.usuario?.apellidos || '',
    usuarioTelefono: recarga.usuario?.telefono || null,
    monto: recarga.monto,
    estado: recarga.estado,
    fechaCreacion: new Date(recarga.created_at),
    fechaActualizacion: new Date(recarga.updated_at),
    montoFormateado,
    puedeModificar: recarga.estado === 'pendiente',
  }
}

// Validadores
export { estadoRecargaSchema, filtroRecargaSchema }
