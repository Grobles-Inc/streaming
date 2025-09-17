/**
 * Utilidades para manejo correcto de fechas en pedidos
 * Evita problemas de zona horaria y cálculos inconsistentes
 */

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
 */
export function parseFechaLocal(fechaString: string): Date {
  const partes = fechaString.split('-')
  const año = parseInt(partes[0])
  const mes = parseInt(partes[1]) - 1 // Los meses en Date son 0-indexed
  const dia = parseInt(partes[2])
  return new Date(año, mes, dia)
}

/**
 * Calcula días restantes entre dos fechas de manera consistente
 * Usa solo la fecha (sin hora) para evitar problemas de zona horaria
 * 
 * Lógica: Si expira el 14/09 y hoy es 14/09, queda 1 día (el día actual)
 *         Solo expira cuando comienza el día siguiente (15/09)
 */
export function calcularDiasRestantes(fechaFin: Date | string): number {
  const fechaFinLocal = typeof fechaFin === 'string' 
    ? parseFechaLocal(fechaFin) 
    : new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate())
  
  const fechaActualLocal = getFechaActualLocal()
  
  const diferenciaMilisegundos = fechaFinLocal.getTime() - fechaActualLocal.getTime()
  // Usamos Math.floor y sumamos 1 para incluir el día actual
  // Si fechaFin = fechaActual, diferencia = 0, Math.floor(0) + 1 = 1 día restante
  // Si fechaFin < fechaActual, diferencia < 0, resultado será <= 0 (expirado)
  const diasRestantes = Math.floor(diferenciaMilisegundos / (24 * 60 * 60 * 1000)) + 1
  
  return diasRestantes
}

/**
 * Calcula la fecha de expiración sumando días a una fecha de inicio
 * Mantiene consistencia en cálculos de duración
 */
export function calcularFechaExpiracion(fechaInicio: Date | string, diasDuracion: number): Date {
  const fechaInicioLocal = typeof fechaInicio === 'string' 
    ? parseFechaLocal(fechaInicio) 
    : new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate())
  
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
 * Incluye tanto el día de inicio como el día de fin (ambos inclusive)
 */
export function calcularDuracionEnDias(fechaInicio: string, fechaExpiracion: string): number {
  if (!fechaInicio || !fechaExpiracion) return 0
  
  const inicio = parseFechaLocal(fechaInicio)
  const fin = parseFechaLocal(fechaExpiracion)
  
  const diferenciaMilisegundos = fin.getTime() - inicio.getTime()
  const diasDuracion = Math.floor(diferenciaMilisegundos / (24 * 60 * 60 * 1000)) + 1 // +1 para incluir ambos días
  
  return Math.max(0, diasDuracion)
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatearFechaParaMostrar(fecha: Date | string): string {
  let fechaObj: Date
  if (typeof fecha === 'string') {
    // Si es string, usar parseFechaLocal para evitar problemas de timezone
    fechaObj = parseFechaLocal(fecha)
  } else {
    fechaObj = fecha
  }
  return fechaObj.toLocaleDateString('es-ES')
}
