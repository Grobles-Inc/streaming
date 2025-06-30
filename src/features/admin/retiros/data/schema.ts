import { z } from 'zod'

// Esquema para estado de retiro
const estadoRetiroSchema = z.union([
  z.literal('aprobado'),
  z.literal('pendiente'),
  z.literal('rechazado'),
])
export type EstadoRetiro = z.infer<typeof estadoRetiroSchema>

// Esquema para retiro base
const retiroBaseSchema = z.object({
  id: z.string(),
  usuario_id: z.string(),
  monto: z.number().min(0),
  estado: estadoRetiroSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

// Esquema para retiro con usuario y billetera
const retiroWithUserSchema = retiroBaseSchema.extend({
  usuario: z.object({
    id: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    telefono: z.string().nullable(),
    billeteras: z.array(z.object({
      id: z.string(),
      saldo: z.number(),
    })).optional(),
  }).optional(),
})

// Esquema para retiro mapeado
const mappedRetiroSchema = z.object({
  id: z.string(),
  usuarioId: z.string(),
  usuarioNombre: z.string(),
  usuarioNombres: z.string(),
  usuarioApellidos: z.string(),
  usuarioTelefono: z.string().nullable(),
  saldoBilletera: z.number(),
  billeteraId: z.string().nullable(),
  monto: z.number(),
  estado: estadoRetiroSchema,
  fechaCreacion: z.date(),
  fechaActualizacion: z.date(),
  montoFormateado: z.string(),
  saldoFormateado: z.string(),
  puedeModificar: z.boolean(),
  puedeAprobar: z.boolean(),
})

// Esquema para filtros
const filtroRetiroSchema = z.object({
  estado: estadoRetiroSchema.optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  usuarioId: z.string().optional(),
})

// Tipos exportados
export type RetiroBase = z.infer<typeof retiroBaseSchema>
export type RetiroWithUser = z.infer<typeof retiroWithUserSchema>
export type MappedRetiro = z.infer<typeof mappedRetiroSchema>
export type FiltroRetiro = z.infer<typeof filtroRetiroSchema>

// Función para mapear retiro de Supabase a componente
export function mapSupabaseRetiroToComponent(retiro: RetiroWithUser): MappedRetiro {
  const nombreCompleto = retiro.usuario 
    ? `${retiro.usuario.nombres} ${retiro.usuario.apellidos}`.trim()
    : 'Usuario no encontrado'
  
  const montoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(retiro.monto)

  // Obtener saldo de la billetera
  const saldoBilletera = retiro.usuario?.billeteras?.[0]?.saldo || 0
  const billeteraId = retiro.usuario?.billeteras?.[0]?.id || null
  
  const saldoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(saldoBilletera)

  // Validar si se puede aprobar (saldo suficiente)
  const puedeAprobar = saldoBilletera >= retiro.monto

  return {
    id: retiro.id,
    usuarioId: retiro.usuario_id,
    usuarioNombre: nombreCompleto,
    usuarioNombres: retiro.usuario?.nombres || '',
    usuarioApellidos: retiro.usuario?.apellidos || '',
    usuarioTelefono: retiro.usuario?.telefono || null,
    saldoBilletera,
    billeteraId,
    monto: retiro.monto,
    estado: retiro.estado,
    fechaCreacion: new Date(retiro.created_at),
    fechaActualizacion: new Date(retiro.updated_at),
    montoFormateado,
    saldoFormateado,
    puedeModificar: retiro.estado === 'pendiente',
    puedeAprobar,
  }
}

// Validadores
export { estadoRetiroSchema, filtroRetiroSchema }
