import { supabase } from '@/lib/supabase'
import { VentasReporte, ProductoPopular, VentaReciente, InventarioReporte, GananciasProducto, EstadisticasGenerales } from '../types'

// Query para obtener estadísticas generales del proveedor
export async function getEstadisticasGenerales(proveedorId: string): Promise<EstadisticasGenerales | null> {
  try {
    // Ventas totales e ingresos (usando estado 'completado' o similar)
    const { data: ventasData } = await supabase
      .from('compras')
      .select('precio')
      .eq('proveedor_id', proveedorId)

    // Productos activos
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, stock')
      .eq('proveedor_id', proveedorId)

    // Stock total
    const { data: stockData } = await supabase
      .from('stock_productos')
      .select('estado')
      .in('producto_id', productosData?.map(p => p.id) || [])

    // Clientes únicos
    const { data: clientesData } = await supabase
      .from('compras')
      .select('telefono_cliente')
      .eq('proveedor_id', proveedorId)

    const ventasCompletadas = ventasData?.length || 0
    const ingresosTotales = ventasData?.reduce((sum, venta) => sum + Number(venta.precio), 0) || 0
    const productosActivos = productosData?.length || 0
    const stockTotal = stockData?.length || 0
    const stockDisponible = stockData?.filter(s => s.estado === 'disponible').length || 0
    const clientesUnicos = new Set(clientesData?.map(c => c.telefono_cliente)).size
    const conversionRate = stockTotal > 0 ? ((stockTotal - stockDisponible) / stockTotal) * 100 : 0

    return {
      ventas_totales: ventasCompletadas,
      ingresos_totales: ingresosTotales,
      productos_activos: productosActivos,
      stock_total: stockTotal,
      clientes_unicos: clientesUnicos,
      conversion_rate: Number(conversionRate.toFixed(1))
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error)
    return null
  }
}

// Query para obtener evolución de ventas por mes
export async function getVentasPorMes(proveedorId: string, meses: number = 6): Promise<VentasReporte[]> {
  try {
    const fechaInicio = new Date()
    fechaInicio.setMonth(fechaInicio.getMonth() - meses)

    const { data } = await supabase
      .from('compras')
      .select('precio, created_at, producto_id')
      .eq('proveedor_id', proveedorId)
      .gte('created_at', fechaInicio.toISOString())
      .order('created_at', { ascending: true })

    if (!data) return []

    // Agrupar por mes
    const ventasPorMes: { [key: string]: { ventas: number; ingresos: number; productos: Set<string> } } = {}

    data.forEach((compra) => {
      const fecha = new Date(compra.created_at)
      const mesKey = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })

      if (!ventasPorMes[mesKey]) {
        ventasPorMes[mesKey] = { ventas: 0, ingresos: 0, productos: new Set() }
      }

      ventasPorMes[mesKey].ventas += 1
      ventasPorMes[mesKey].ingresos += Number(compra.precio)
      ventasPorMes[mesKey].productos.add(compra.producto_id)
    })

    return Object.entries(ventasPorMes).map(([mes, datos]) => ({
      mes,
      ventas: datos.ventas,
      ingresos: datos.ingresos,
      productos_vendidos: datos.productos.size
    }))
  } catch (error) {
    console.error('Error obteniendo ventas por mes:', error)
    return []
  }
}

// Query para obtener productos más populares
export async function getProductosPopulares(proveedorId: string, limite: number = 10): Promise<ProductoPopular[]> {
  try {
    // Primero obtenemos las compras
    const { data: comprasData } = await supabase
      .from('compras')
      .select('producto_id, precio')
      .eq('proveedor_id', proveedorId)

    if (!comprasData) return []

    // Obtenemos los IDs únicos de productos
    const productosIds = [...new Set(comprasData.map(c => c.producto_id))]

    // Obtenemos la información de los productos
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre')
      .in('id', productosIds)

    if (!productosData) return []

    // Agrupar por producto
    const productosMap: { [key: string]: { nombre: string; ventas: number; ingresos: number } } = {}

    // Crear mapa de nombres de productos
    const nombresProductos = Object.fromEntries(
      productosData.map(p => [p.id, p.nombre])
    )

    comprasData.forEach((compra) => {
      const productoId = compra.producto_id
      const nombre = nombresProductos[productoId] || 'Producto desconocido'

      if (!productosMap[productoId]) {
        productosMap[productoId] = { nombre, ventas: 0, ingresos: 0 }
      }

      productosMap[productoId].ventas += 1
      productosMap[productoId].ingresos += Number(compra.precio)
    })

    const colores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

    return Object.entries(productosMap)
      .map(([id, datos], index) => ({
        id,
        nombre: datos.nombre,
        ventas: datos.ventas,
        ingresos: datos.ingresos,
        color: colores[index % colores.length]
      }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, limite)
  } catch (error) {
    console.error('Error obteniendo productos populares:', error)
    return []
  }
}

// Query para obtener ventas recientes
export async function getVentasRecientes(proveedorId: string, limite: number = 10): Promise<VentaReciente[]> {
  try {
    const { data: comprasData } = await supabase
      .from('compras')
      .select('id, precio, estado, nombre_cliente, created_at, producto_id')
      .eq('proveedor_id', proveedorId)
      .order('created_at', { ascending: false })
      .limit(limite)

    if (!comprasData) return []

    // Obtenemos los nombres de los productos
    const productosIds = comprasData.map(c => c.producto_id)
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre')
      .in('id', productosIds)

    const nombresProductos = Object.fromEntries(
      (productosData || []).map(p => [p.id, p.nombre])
    )

    return comprasData.map((compra) => ({
      id: compra.id,
      producto_nombre: nombresProductos[compra.producto_id] || 'Producto desconocido',
      vendedor_nombre: '', // Campo no usado
      cliente_nombre: compra.nombre_cliente,
      precio: Number(compra.precio),
      fecha: new Date(compra.created_at).toLocaleDateString('es-ES'),
      estado: compra.estado
    }))
  } catch (error) {
    console.error('Error obteniendo ventas recientes:', error)
    return []
  }
}

// Query para obtener reporte de inventario
export async function getInventarioReporte(proveedorId: string): Promise<InventarioReporte[]> {
  try {
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre, stock, categoria_id')
      .eq('proveedor_id', proveedorId)

    if (!productosData) return []

    // Obtenemos los nombres de las categorías
    const categoriasIds = productosData.map(p => p.categoria_id)
    const { data: categoriasData } = await supabase
      .from('categorias')
      .select('id, nombre')
      .in('id', categoriasIds)

    const nombresCategorias = Object.fromEntries(
      (categoriasData || []).map(c => [c.id, c.nombre])
    )

    // Obtenemos el stock de productos
    const productosIds = productosData.map(p => p.id)
    const { data: stockData } = await supabase
      .from('stock_productos')
      .select('producto_id, estado')
      .in('producto_id', productosIds)

    return productosData.map((producto) => {
      const stockProducto = (stockData || []).filter(s => s.producto_id === producto.id)
      const stockDisponible = stockProducto.filter(s => s.estado === 'disponible').length
      const stockVendido = stockProducto.filter(s => s.estado === 'vendido').length
      const totalStock = stockProducto.length

      return {
        producto_id: producto.id,
        producto_nombre: producto.nombre,
        stock_disponible: stockDisponible,
        stock_vendido: stockVendido,
        total_stock: totalStock,
        categoria: nombresCategorias[producto.categoria_id] || 'Sin categoría'
      }
    })
  } catch (error) {
    console.error('Error obteniendo reporte de inventario:', error)
    return []
  }
}

// Query para obtener análisis de ganancias por producto
export async function getGananciasProductos(proveedorId: string): Promise<GananciasProducto[]> {
  try {
    // Primero obtenemos los productos del proveedor
    const { data: productosData } = await supabase
      .from('productos')
      .select('id, nombre, precio_publico, precio_vendedor')
      .eq('proveedor_id', proveedorId)

    if (!productosData) return []

    // Luego obtenemos las compras para cada producto
    const productosConGanancias = await Promise.all(
      productosData.map(async (producto) => {
        const { data: comprasData } = await supabase
          .from('compras')
          .select('precio')
          .eq('producto_id', producto.id)
          .eq('proveedor_id', proveedorId)

        const ventasCompletadas = comprasData || []
        const ventasCantidad = ventasCompletadas.length
        const gananciasUnitaria = Number(producto.precio_publico) - Number(producto.precio_vendedor)
        const gananciasTotal = ventasCantidad * gananciasUnitaria

        return {
          producto_id: producto.id,
          producto_nombre: producto.nombre,
          precio_publico: Number(producto.precio_publico),
          precio_vendedor: Number(producto.precio_vendedor),
          margen: gananciasUnitaria,
          ventas_cantidad: ventasCantidad,
          ganancias_totales: gananciasTotal
        }
      })
    )

    return productosConGanancias.sort((a, b) => b.ganancias_totales - a.ganancias_totales)
  } catch (error) {
    console.error('Error obteniendo ganancias por producto:', error)
    return []
  }
} 