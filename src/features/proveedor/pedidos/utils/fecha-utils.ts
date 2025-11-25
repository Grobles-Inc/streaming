/**
 * Utilidades para manejo correcto de fechas en pedidos
 * Evita problemas de zona horaria y cálculos inconsistentes
 */
import { differenceInDays, startOfDay, parseISO } from 'date-fns'

/**
 * Obtiene la fecha actual en la zona horaria local a las 00:00:00
 * Esto asegura comparaciones consistentes de días
 */
export function getFechaActualLocal(): Date {
  const ahora = new Date()
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
}

/**
 * Convierte una fecha string a Date local a las 00:00:00
 * Evita problemas de zona horaria al interpretar fechas
 * Usa split para evitar problemas de timezone con new Date(string)
 * Solo extrae año, mes y día, ignorando completamente horas, minutos y segundos
 */
export function parseFechaLocal(fechaString: string): Date {
  // Extraer solo la parte de fecha (YYYY-MM-DD), ignorando cualquier hora/minuto/segundo
  const fechaSolo = fechaString.split('T')[0].split(' ')[0]
  const partes = fechaSolo.split('-')
  const año = parseInt(partes[0])
  const mes = parseInt(partes[1]) - 1 // Los meses en Date son 0-indexed
  const dia = parseInt(partes[2])
  return new Date(año, mes, dia)
}

export function calcularDiasRestantes(fechaFin: Date | string): number {
  let fechaFinDate: Date

  if (typeof fechaFin === 'string') {
    // Si es string ISO con hora, parsear y tomar solo la fecha para
    // asegurar que 'startOfDay' lo trate consistentemente.
    // parseISO() es más robusto que un simple split.
    const parsedDate = parseISO(fechaFin)
    fechaFinDate = startOfDay(parsedDate)
  } else {
    fechaFinDate = startOfDay(fechaFin)
  }

  // Obtenemos el inicio del día actual (sin componentes de hora).
  const fechaActual = startOfDay(new Date())

  // differenceInDays(fecha_posterior, fecha_anterior)
  // Esto nos da cuántos días enteros hay entre la fecha de expiración y hoy.
  return differenceInDays(fechaFinDate, fechaActual)
}

/**
 * Calcula la fecha de expiración sumando días a una fecha de inicio
 * Mantiene consistencia en cálculos de duración
 */
export function calcularFechaExpiracion(
  fechaInicio: Date | string,
  diasDuracion: number
): Date {
  const fechaInicioLocal =
    typeof fechaInicio === 'string'
      ? parseFechaLocal(fechaInicio)
      : new Date(
          fechaInicio.getFullYear(),
          fechaInicio.getMonth(),
          fechaInicio.getDate()
        )

  const fechaExpiracion = new Date(fechaInicioLocal)
  fechaExpiracion.setDate(fechaExpiracion.getDate() + diasDuracion)

  return fechaExpiracion
}

/**
 * Convierte una fecha a string para input type="date"
 * Evita problemas de zona horaria al mostrar fechas en formularios
 */
export function formatearFechaParaInput(fecha: Date | string | null): string {
  if (!fecha) return ''

  let fechaObj: Date
  if (typeof fecha === 'string') {
    // Si es string, usar parseFechaLocal para evitar problemas de timezone
    fechaObj = parseFechaLocal(fecha)
  } else {
    fechaObj = fecha
  }

  // Usar la fecha local sin conversión UTC
  const año = fechaObj.getFullYear()
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
  const dia = String(fechaObj.getDate()).padStart(2, '0')

  return `${año}-${mes}-${dia}`
}

/**
 * Calcula la duración en días entre dos fechas
 * Para usar en formularios de edición
 * Usa solo días, ignorando horas, minutos y segundos
 */
export function calcularDuracionEnDias(
  fechaInicio: string,
  fechaExpiracion: string
): number {
  if (!fechaInicio || !fechaExpiracion) return 0

  const inicioSolo = fechaInicio.split('T')[0]
  const finSolo = fechaExpiracion.split('T')[0]

  const inicio = startOfDay(parseISO(inicioSolo))
  const fin = startOfDay(parseISO(finSolo))

  return Math.max(0, differenceInDays(fin, inicio))
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatearFechaParaMostrar(fecha: Date | string): string {
  let fechaObj: Date
  if (typeof fecha === 'string') {
    fechaObj = parseFechaLocal(fecha)
  } else {
    fechaObj = fecha
  }
  const dia = String(fechaObj.getDate()).padStart(2, '0')
  const mes = String(fechaObj.getMonth() + 1).padStart(2, '0')
  const año = String(fechaObj.getFullYear()).slice(-2)
  return `${dia}/${mes}/${año}`
}
