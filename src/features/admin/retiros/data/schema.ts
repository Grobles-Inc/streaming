import { z } from 'zod'
import type { RetiroWithUser } from './types'

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
export type MappedRetiro = z.infer<typeof mappedRetiroSchema>
export type FiltroRetiro = z.infer<typeof filtroRetiroSchema>

// Función para mapear retiro de Supabase a componente
export function mapSupabaseRetiroToComponent(retiro: RetiroWithUser): MappedRetiro {
  // Usar la estructura usuarios del servicio
  const usuario = retiro.usuarios
  
  const nombreCompleto = usuario 
    ? `${usuario.nombres} ${usuario.apellidos}`.trim()
    : 'Usuario no encontrado'
  
  const montoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(retiro.monto)

  // Para obtener el saldo, necesitamos hacer una consulta separada o pasar el saldo como parámetro
  // Por ahora asumimos 0 y marcamos que no se puede aprobar hasta validar
  const saldoBilletera = 0 // Se validará en tiempo real al aprobar
  const billeteraId = usuario?.billetera_id || null
  
  const saldoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(saldoBilletera)

  // La validación del saldo se hará en el servicio al momento de aprobar
  const puedeAprobar = retiro.estado === 'pendiente'

  return {
    id: retiro.id,
    usuarioId: retiro.usuario_id,
    usuarioNombre: nombreCompleto,
    usuarioNombres: usuario?.nombres || '',
    usuarioApellidos: usuario?.apellidos || '',
    usuarioTelefono: usuario?.telefono || null,
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
