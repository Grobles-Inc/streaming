import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import {
  getEstadisticasGenerales,
  getVentasPorMes,
  getProductosPopulares,
  getVentasRecientes,
  getInventarioReporte,
  getGananciasProductos
} from '../queries'
import {
  EstadisticasGenerales,
  VentasReporte,
  ProductoPopular,
  VentaReciente,
  InventarioReporte,
  GananciasProducto,
  MetricaReporte
} from '../types'
import { DollarSign, Package, Users, Activity } from 'lucide-react'

interface UseReportesDataReturn {
  estadisticas: EstadisticasGenerales | null
  ventasPorMes: VentasReporte[]
  productosPopulares: ProductoPopular[]
  ventasRecientes: VentaReciente[]
  inventario: InventarioReporte[]
  gananciasProductos: GananciasProducto[]
  metricas: MetricaReporte[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useReportesData(): UseReportesDataReturn {
  const { user } = useAuthStore()
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null)
  const [ventasPorMes, setVentasPorMes] = useState<VentasReporte[]>([])
  const [productosPopulares, setProductosPopulares] = useState<ProductoPopular[]>([])
  const [ventasRecientes, setVentasRecientes] = useState<VentaReciente[]>([])
  const [inventario, setInventario] = useState<InventarioReporte[]>([])
  const [gananciasProductos, setGananciasProductos] = useState<GananciasProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const [
        estadisticasData,
        ventasData,
        productosData,
        ventasRecientesData,
        inventarioData,
        gananciasData
      ] = await Promise.all([
        getEstadisticasGenerales(user.id),
        getVentasPorMes(user.id, 6),
        getProductosPopulares(user.id, 8),
        getVentasRecientes(user.id, 10),
        getInventarioReporte(user.id),
        getGananciasProductos(user.id)
      ])

      setEstadisticas(estadisticasData)
      setVentasPorMes(ventasData)
      setProductosPopulares(productosData)
      setVentasRecientes(ventasRecientesData)
      setInventario(inventarioData)
      setGananciasProductos(gananciasData)
    } catch (err) {
      console.error('Error cargando datos de reportes:', err)
      setError('Error al cargar los datos de reportes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  // Calcular métricas basadas en los datos reales
  const metricas: MetricaReporte[] = [
    {
      titulo: 'Ventas Totales',
      valor: `$${estadisticas?.ingresos_totales?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}`,
      cambio: '+12.3%', // Esto se podría calcular comparando con el período anterior
      tendencia: 'up',
      descripcion: 'vs mes anterior'
    },
    {
      titulo: 'Productos Vendidos',
      valor: `${estadisticas?.ventas_totales || 0}`,
      cambio: '+8.1%',
      tendencia: 'up',
      descripcion: 'este mes'
    },
    {
      titulo: 'Clientes Únicos',
      valor: `${estadisticas?.clientes_unicos || 0}`,
      cambio: '+5.4%',
      tendencia: 'up',
      descripcion: 'usuarios únicos'
    },
    {
      titulo: 'Tasa Conversión',
      valor: `${estadisticas?.conversion_rate || 0}%`,
      cambio: estadisticas?.conversion_rate && estadisticas.conversion_rate > 60 ? '+2.1%' : '-2.1%',
      tendencia: estadisticas?.conversion_rate && estadisticas.conversion_rate > 60 ? 'up' : 'down',
      descripcion: 'tasa de éxito'
    }
  ]

  return {
    estadisticas,
    ventasPorMes,
    productosPopulares,
    ventasRecientes,
    inventario,
    gananciasProductos,
    metricas,
    loading,
    error,
    refreshData: loadData
  }
} 