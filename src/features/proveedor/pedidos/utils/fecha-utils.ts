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
    // Usar parseFechaLocal para extraer solo año, mes y día del string de la DB
    // sin conversión de timezone, ignorando completamente horas/minutos/segundos
    fechaFinDate = parseFechaLocal(fechaFin)
  } else {
    // Si es Date, crear una nueva fecha solo con año, mes y día
    fechaFinDate = new Date(
      fechaFin.getFullYear(),
      fechaFin.getMonth(),
      fechaFin.getDate()
    )
  }

  // Obtener la fecha actual solo con año, mes y día (sin horas/minutos)
  const ahora = new Date()
  const fechaActual = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  )

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

/**
 * Formatea la hora directamente desde el string de la DB sin conversión de timezone
 * Extrae la hora tal como está almacenada en la base de datos
 */
export function formatearHoraDesdeDB(
  fechaString: string | null | undefined
): string {
  if (!fechaString) return 'N/A'

  // Extraer la parte de hora del string (formato: YYYY-MM-DD HH:MM:SS+00 o YYYY-MM-DDTHH:MM:SS+00)
  const match = fechaString.match(/(\d{2}):(\d{2}):?\d{0,2}/)
  if (!match) return 'N/A'

  const horas = parseInt(match[1], 10)
  const minutos = parseInt(match[2], 10)

  // Formatear en 12 horas con AM/PM
  const horas12 = horas === 0 ? 12 : horas > 12 ? horas - 12 : horas
  const ampm = horas >= 12 ? 'p. m.' : 'a. m.'
  const minutosStr = String(minutos).padStart(2, '0')

  return `${horas12}:${minutosStr} ${ampm}`
}

/**
 * Extrae la parte de hora (HH:MM:SS) y timezone desde el string de la DB
 * Retorna solo la parte de tiempo sin la fecha
 * Formato esperado: YYYY-MM-DD HH:MM:SS+00 o YYYY-MM-DDTHH:MM:SS+00
 */
export function extraerHoraDesdeDB(
  fechaString: string | null | undefined
): string | null {
  if (!fechaString) return null

  // Extraer la parte de hora completa (HH:MM:SS) y timezone (+00)
  // Maneja formatos: YYYY-MM-DD HH:MM:SS+00 o YYYY-MM-DDTHH:MM:SS+00
  const match = fechaString.match(/(\d{2}:\d{2}:\d{2}(?:\.\d+)?)([+-]\d{2})?/)
  if (!match) return null

  const horaCompleta = match[1] // HH:MM:SS o HH:MM:SS.mmm
  const timezone = match[2] || '+00' // +00 o -05, etc.

  // Si tiene milisegundos, removerlos
  const horaSinMs = horaCompleta.split('.')[0]

  return `${horaSinMs}${timezone}`
}

/**
 * Combina una fecha (YYYY-MM-DD) con la hora extraída de un datetime string de la DB
 * Preserva el timezone original
 * Útil para mantener la hora cuando solo se edita la fecha
 */
export function combinarFechaYHora(
  fechaNueva: string, // Formato: YYYY-MM-DD
  fechaOriginalConHora: string | null | undefined // Formato: YYYY-MM-DD HH:MM:SS+00
): string | null {
  if (!fechaNueva || !fechaOriginalConHora) return null

  const horaExtraida = extraerHoraDesdeDB(fechaOriginalConHora)
  if (!horaExtraida) {
    // Si no se puede extraer la hora, usar 00:00:00+00 como default
    return `${fechaNueva} 00:00:00+00`
  }

  // Combinar la nueva fecha con la hora original
  return `${fechaNueva} ${horaExtraida}`
}
