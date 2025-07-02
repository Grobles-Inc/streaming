import { useState, useEffect, useCallback } from 'react'
import { ProductosService } from '../services/productos.service'
import { mapSupabaseProductoToComponent } from '../data/schema'
import type { 
  MappedProducto, 
  EstadoProducto,
  FiltroProducto,
  CreateProductoData,
  UpdateProductoData,
  EstadisticasProductos
} from '../data/types'

export function useProductos() {
  const [productos, setProductos] = useState<MappedProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasProductos | null>(null)

  // Cargar productos
  const cargarProductos = useCallback(async (filtros?: FiltroProducto) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading productos with filters:', filtros)
      
      const supabaseProductos = await ProductosService.getProductos(filtros)
      console.log('📦 Raw productos from service:', supabaseProductos.length, supabaseProductos)
      
      const mappedProductos = supabaseProductos.map(mapSupabaseProductoToComponent)
      console.log('🗺️ Mapped productos:', mappedProductos.length, mappedProductos)
      setProductos(mappedProductos)
      
      // Cargar estadísticas solo si no hay filtros específicos
      if (!filtros || Object.keys(filtros).length === 0) {
        try {
          const stats = await ProductosService.getEstadisticasProductos()
          setEstadisticas(stats)
        } catch (statsError) {
          console.warn('⚠️ Could not load estadisticas:', statsError)
          // No detener el flujo principal por errores de estadísticas
        }
      }
      
    } catch (err) {
      console.error('❌ Error loading productos:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear producto
  const crearProducto = async (productoData: CreateProductoData): Promise<boolean> => {
    try {
      setError(null)
      console.log('➕ Creating producto:', productoData)
      
      await ProductosService.createProducto(productoData)
      await cargarProductos() // Recargar la lista
      
      console.log('✅ Producto created successfully')
      return true
    } catch (err) {
      console.error('❌ Error creating producto:', err)
      setError(err instanceof Error ? err.message : 'Error al crear producto')
      return false
    }
  }

  // Actualizar producto
  const actualizarProducto = async (id: string, productoData: Partial<UpdateProductoData>): Promise<boolean> => {
    try {
      setError(null)
      console.log('✏️ Updating producto:', id, productoData)
      
      await ProductosService.updateProducto(id, productoData)
      await cargarProductos() // Recargar la lista
      
      console.log('✅ Producto updated successfully')
      return true
    } catch (err) {
      console.error('❌ Error updating producto:', err)
      setError(err instanceof Error ? err.message : 'Error al actualizar producto')
      return false
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      console.log('🗑️ Deleting producto:', id)
      
      await ProductosService.deleteProducto(id)
      await cargarProductos() // Recargar la lista
      
      console.log('✅ Producto deleted successfully')
      return true
    } catch (err) {
      console.error('❌ Error deleting producto:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar producto')
      return false
    }
  }

  // Cambiar estado del producto
  const cambiarEstadoProducto = async (id: string, nuevoEstado: EstadoProducto): Promise<boolean> => {
    try {
      setError(null)
      console.log('🔄 Changing producto state:', id, nuevoEstado)
      
      await ProductosService.cambiarEstadoProducto(id, nuevoEstado)
      await cargarProductos() // Recargar la lista
      
      console.log('✅ Producto state changed successfully')
      return true
    } catch (err) {
      console.error('❌ Error changing producto state:', err)
      setError(err instanceof Error ? err.message : 'Error al cambiar estado del producto')
      return false
    }
  }

  // Duplicar producto
  const duplicarProducto = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      console.log('📋 Duplicating producto:', id)
      
      await ProductosService.duplicarProducto(id)
      await cargarProductos() // Recargar la lista
      
      console.log('✅ Producto duplicated successfully')
      return true
    } catch (err) {
      console.error('❌ Error duplicating producto:', err)
      setError(err instanceof Error ? err.message : 'Error al duplicar producto')
      return false
    }
  }

  // Aplicar filtros
  const aplicarFiltros = async (filtros: FiltroProducto) => {
    await cargarProductos(filtros)
  }

  // Refrescar productos
  const refreshProductos = async () => {
    await cargarProductos()
  }

  // Obtener producto por ID
  const obtenerProductoPorId = async (id: string): Promise<MappedProducto | null> => {
    try {
      const supabaseProducto = await ProductosService.getProductoById(id)
      if (!supabaseProducto) return null
      
      return mapSupabaseProductoToComponent(supabaseProducto)
    } catch (err) {
      console.error('❌ Error fetching producto by ID:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener producto')
      return null
    }
  }

  // Limpiar error
  const clearError = () => {
    setError(null)
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  // Calcular contadores
  const cantidadPublicados = productos.filter(p => p.estado === 'publicado').length
  const cantidadBorradores = productos.filter(p => p.estado === 'borrador').length
  const cantidadNuevos = productos.filter(p => p.nuevo).length
  const cantidadDestacados = productos.filter(p => p.destacado).length

  return {
    // Estado
    productos,
    loading,
    error,
    estadisticas,
    
    // Contadores
    cantidadPublicados,
    cantidadBorradores,
    cantidadNuevos,
    cantidadDestacados,
    
    // Acciones CRUD
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    duplicarProducto,
    
    // Acciones de estado
    cambiarEstadoProducto,
    
    // Utilidades
    aplicarFiltros,
    refreshProductos,
    obtenerProductoPorId,
    clearError,
  }
}
