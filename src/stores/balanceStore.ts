import { create } from 'zustand'

interface EstadoSaldo {
  monto: number
  moneda: string
  cargando: boolean
  error: string | null
  // Actualizar
 actualizarSaldo: (monto: number) => void
  // Reiniciar
  reiniciar: () => void
}

export const useSaldoStore = create<EstadoSaldo>()((set) => ({
  monto: 0,
  moneda: 'USD',
  cargando: false,
  error: null,

  actualizarSaldo: (nuevoMonto) => set((state) => ({
    ...state,
    monto: nuevoMonto
  })),

  reiniciar: () => set({
    monto: 0,
    moneda: 'USD',
    cargando: false,
    error: null
  })
}))

// Hook para acceso al estado del saldo
export const useSaldo = () => useSaldoStore((state) => state) 