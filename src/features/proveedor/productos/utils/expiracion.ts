export function etiquetaDuracionCartel(dias: number): string {
  if (dias === 180) return '6 meses'
  return `${dias} ${dias === 1 ? 'día' : 'días'}`
}

/**
 * Costo del cartel para una duración. La base siempre está expresada por
 * 30 días, así que 15 días cobra la mitad y 180 días cobra 6 veces.
 */
export function calcularCostoCartel(base30: number, dias: number): number {
  return Math.round(base30 * (dias / 30) * 100) / 100
}

export type EstadoExpiracion = 'vigente' | 'por_vencer' | 'vencido' | 'sin_expirar'

export interface InfoExpiracion {
  estado: EstadoExpiracion
  diasRestantes: number
  fechaExpiracion: Date | null
  mensaje: string
  color: 'green' | 'yellow' | 'red' | 'gray'
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}

/**
 * Calcula el estado de expiración de un producto
 */
export function calcularEstadoExpiracion(
  estado: string, 
  fechaExpiracion: string | null
): InfoExpiracion {
  // Si el producto está en borrador, no tiene expiración
  if (estado === 'borrador') {
    return {
      estado: 'sin_expirar',
      diasRestantes: 0,
      fechaExpiracion: null,
      mensaje: 'Producto en borrador',
      color: 'gray',
      variant: 'outline'
    }
  }

  // Si no tiene fecha de expiración establecida
  if (!fechaExpiracion) {
    return {
      estado: 'sin_expirar',
      diasRestantes: 0,
      fechaExpiracion: null,
      mensaje: 'Sin fecha de expiración',
      color: 'gray',
      variant: 'outline'
    }
  }

  const ahora = new Date()
  const fechaExp = new Date(fechaExpiracion)
  const diferenciaMilisegundos = fechaExp.getTime() - ahora.getTime()
  const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24))

  if (diasRestantes < 0) {
    return {
      estado: 'vencido',
      diasRestantes: Math.abs(diasRestantes),
      fechaExpiracion: fechaExp,
      mensaje: `Vencido hace ${Math.abs(diasRestantes)} día(s)`,
      color: 'red',
      variant: 'destructive'
    }
  }

  if (diasRestantes <= 7) {
    return {
      estado: 'por_vencer',
      diasRestantes,
      fechaExpiracion: fechaExp,
      mensaje: diasRestantes === 0 
        ? 'Vence hoy' 
        : `Vence en ${diasRestantes} día(s)`,
      color: 'yellow',
      variant: 'secondary'
    }
  }

  return {
    estado: 'vigente',
    diasRestantes,
    fechaExpiracion: fechaExp,
    mensaje: `Vigente ${diasRestantes} día(s)`,
    color: 'green',
    variant: 'default'
  }
}

/**
 * Calcula la nueva fecha de expiración para renovar un producto
 * Extiende la duración del cartel sobre la fecha de expiración actual. Si el
 * producto ya venció, la extensión arranca desde hoy para no perder días.
 * @param fechaExpiracion - Fecha actual de expiración
 * @param diasCartel - Días de duración del cartel
 */
export function calcularNuevaFechaExpiracion(
  fechaExpiracion: string,
  diasCartel: number
): string {
  const ahora = new Date()
  const fechaExp = new Date(fechaExpiracion)
  const fechaBase = fechaExp.getTime() > ahora.getTime() ? fechaExp : ahora
  const newDate = new Date(fechaBase.getTime())

  newDate.setDate(newDate.getDate() + diasCartel)

  return newDate.toISOString()
}

/**
 * Calcula fecha de expiración inicial (desde ahora)
 * @param dias - Días desde hoy
 */
export function calcularFechaExpiracionInicial(dias: number): string {
  const ahora = new Date()
  const nuevaFecha = new Date(ahora.setDate(ahora.getDate() + dias))
  
  return nuevaFecha.toISOString()
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatearFechaExpiracion(fecha: string | null): string {
  if (!fecha) return 'Sin fecha'
  
  const fechaObj = new Date(fecha)
  return fechaObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

 