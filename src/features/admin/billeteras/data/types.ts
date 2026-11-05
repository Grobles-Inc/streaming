export type Billetera = {
  id: string
  usuario_id: string
  saldo: number
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    usuario: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type Recarga = {
  id: number
  usuario_id: string
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    usuario: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type Retiro = {
  id: number
  usuario_id: string
  monto: number
  estado: 'aprobado' | 'pendiente' | 'rechazado'
  created_at: string
  updated_at: string
  usuario?: {
    id: string
    usuario: string
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
    rol: 'provider' | 'admin' | 'seller'
  }
}

export type MovimientoTipo = 'recarga' | 'retiro' | 'compra' | 'renovacion'

export type MovimientoSubtipo = 'pedido' | 'producto'

export type MovimientoDireccion = 'entrada' | 'salida'

export type MovimientoBilleteraRow = {
  id: number
  usuarioId: string
  tipo: MovimientoTipo
  subtipo: MovimientoSubtipo | null
  direccion: MovimientoDireccion
  monto: number
  estado: string
  fecha: string
  referenciaId: number | null
  descripcion: string | null
  contraparteUsuario: string | null
  contraparteRol: 'seller' | 'provider' | null
}

export type GetMovimientosBilleteraAdminParams = {
  usuarioId: string
  tipo: MovimientoTipo | null
  subtipo: MovimientoSubtipo | null
  estado: string | null
  fechaDesde: string | null
  fechaHasta: string | null
  page: number
  pageSize: number
}

export type GetMovimientosBilleteraAdminResponse = {
  data: MovimientoBilleteraRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalPorTipo: Record<MovimientoTipo, number>
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
