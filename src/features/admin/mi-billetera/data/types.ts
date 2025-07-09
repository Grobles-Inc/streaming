// Tipos para las comisiones y transacciones de mi billetera

export interface ComisionPublicacion {
  id: string
  producto_id: string
  proveedor_id: string
  admin_id: string
  monto_comision: number
  porcentaje_comision: number
  fecha_publicacion: string
  producto: {
    nombre: string
    precio_publico: number
    estado: string
  }
  proveedor: {
    nombres: string
    apellidos: string
    usuario: string
  }
  created_at: string
}

export interface ComisionRetiro {
  id: string
  retiro_id: number
  usuario_id: string
  admin_id: string
  monto_retiro: number
  monto_comision: number
  porcentaje_comision: number
  fecha_retiro: string
  usuario: {
    nombres: string
    apellidos: string
    usuario: string
  }
  created_at: string
}

export interface ComisionGeneral {
  id: string
  tipo: 'publicacion' | 'retiro'
  usuario_id: string
  monto_base: number
  monto_comision: number
  porcentaje_comision: number
  fecha_transaccion: string
  descripcion: string
  usuario: {
    nombres: string
    apellidos: string
    usuario: string
  }
  producto?: {
    nombre: string
  }
  created_at: string
}

export interface FiltrosComisiones {
  fechaInicio?: string
  fechaFin?: string
  tipo?: 'publicacion' | 'retiro' | 'todos'
  usuario?: string
  producto?: string
}

export interface EstadisticasComisiones {
  totalComisionesPublicacion: number
  totalComisionesRetiro: number
  totalComisiones: number
  cantidadPublicaciones: number
  cantidadRetiros: number
  promedioComisionPublicacion: number
  promedioComisionRetiro: number
}
