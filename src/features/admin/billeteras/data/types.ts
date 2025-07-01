export type Billetera = {
  id: string
  usuario_id: string
  saldo: number
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type Recarga = {
  id: string
  usuario_id: string
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type Retiro = {
  id: string
  usuario_id: string
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type MovimientoBilletera = {
  id: string
  tipo: 'recarga' | 'retiro'
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  fecha: string
  usuario?: {
    nombres: string
    apellidos: string
    email: string
  }
}

export type RecargaFormData = {
  usuario_id: string
  monto: number
}

export type RetiroFormData = {
  usuario_id: string
  monto: number
}

export interface BilleteraFilters {
  usuario?: string
  montoMin?: number
  montoMax?: number
  fechaDesde?: string
  fechaHasta?: string
}

export interface MovimientosFilters {
  tipo?: 'recarga' | 'retiro' | null
  estado?: 'aprobado' | 'pendiente' | 'rechazado' | null
  usuario?: string
  montoMin?: number
  montoMax?: number
  fechaDesde?: string
  fechaHasta?: string
}
