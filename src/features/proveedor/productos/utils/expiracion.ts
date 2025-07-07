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
 * @param fechaActual - Fecha actual de expiración (puede ser null)
 * @param diasRenovacion - Días a agregar (por defecto 30)
 */
export function calcularNuevaFechaExpiracion(
  fechaActual: string | null,
  diasRenovacion: number = 30
): string {
  const ahora = new Date()
  let fechaBase: Date

  if (fechaActual) {
    const fechaExp = new Date(fechaActual)
    // Si la fecha actual está en el futuro, usarla como base
    // Si ya venció, usar la fecha actual
    fechaBase = fechaExp > ahora ? fechaExp : ahora
  } else {
    // Si no hay fecha, usar la fecha actual
    fechaBase = ahora
  }

  const nuevaFecha = new Date(fechaBase)
  nuevaFecha.setDate(nuevaFecha.getDate() + diasRenovacion)
  
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

/**
 * Verifica si un producto necesita renovación (vencido o por vencer)
 */
export function necesitaRenovacion(estado: string, fechaExpiracion: string | null): boolean {
  const info = calcularEstadoExpiracion(estado, fechaExpiracion)
  return info.estado === 'vencido' || info.estado === 'por_vencer'
}

/**
 * Obtiene productos que necesitan atención (vencidos o por vencer)
 */
export function obtenerProductosConAlerta<T extends { estado: string; fecha_expiracion: string | null }>(
  productos: T[]
): T[] {
  return productos.filter(producto => 
    necesitaRenovacion(producto.estado, producto.fecha_expiracion)
  )
} 