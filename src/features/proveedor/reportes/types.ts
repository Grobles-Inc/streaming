export interface VentasReporte {
  mes: string
  ventas: number
  ingresos: number
  productos_vendidos: number
}

export interface ProductoPopular {
  id: string
  nombre: string
  ventas: number
  ingresos: number
  color?: string
}

export interface VentaReciente {
  id: string
  producto_nombre: string
  vendedor_nombre: string
  cliente_nombre: string
  precio: number
  fecha: string
  estado: string
}

export interface MetricaReporte {
  titulo: string
  valor: string
  cambio: string
  tendencia: 'up' | 'down'
  descripcion: string
}

export interface InventarioReporte {
  producto_id: string
  producto_nombre: string
  stock_disponible: number
  stock_vendido: number
  total_stock: number
  categoria: string
}

export interface GananciasProducto {
  producto_id: string
  producto_nombre: string
  precio_publico: number
  precio_vendedor: number
  margen: number
  ventas_cantidad: number
  ganancias_totales: number
}

export interface EstadisticasGenerales {
  ventas_totales: number
  ingresos_totales: number
  productos_activos: number
  stock_total: number
  clientes_unicos: number
  conversion_rate: number
}

export interface FiltrosFecha {
  fecha_inicio: string
  fecha_fin: string
  periodo: 'dia' | 'semana' | 'mes' | 'año'
} 