import { useState, useEffect } from 'react'
import { CategoriasService } from '../services'
import type { Categoria, Producto } from '../data/types'

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await CategoriasService.getCategorias()
      setCategorias(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const createCategoria = async (categoriaData: { nombre: string; descripcion: string; imagen_url: string }) => {
    try {
      const newCategoria = await CategoriasService.createCategoria(categoriaData)
      setCategorias(prev => [newCategoria, ...prev])
      return newCategoria
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría')
      throw err
    }
  }

  const updateCategoria = async (id: string, categoriaData: Partial<{ nombre: string; descripcion: string; imagen_url: string }>) => {
    try {
      const updatedCategoria = await CategoriasService.updateCategoria(id, categoriaData)
      setCategorias(prev => prev.map(cat => cat.id === id ? updatedCategoria : cat))
      return updatedCategoria
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría')
      throw err
    }
  }

  const updateCategoriasOrden = async (reorderedCategorias: Categoria[]) => {
    try {
      // Actualizar el estado local inmediatamente para mejor UX
      setCategorias(reorderedCategorias)
      
      // Preparar los datos para la actualización en la base de datos
      const ordenUpdates = reorderedCategorias.map(categoria => ({
        id: categoria.id,
        orden: categoria.orden
      }))
      
      // Actualizar en la base de datos
      await CategoriasService.updateCategoriasOrden(ordenUpdates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar orden de categorías')
      // Revertir los cambios en caso de error
      await fetchCategorias()
      throw err
    }
  }

  const moveToFirst = async (categoria: Categoria) => {
    try {
      // Crear una copia de las categorías ordenadas por orden
      const sortedCategorias = [...categorias].sort((a, b) => a.orden - b.orden)
      
      // Filtrar la categoría a mover
      const otherCategorias = sortedCategorias.filter(cat => cat.id !== categoria.id)
      
      // Crear el nuevo arreglo con la categoría al principio
      const reorderedCategorias = [
        { ...categoria, orden: 1 },
        ...otherCategorias.map((cat, index) => ({ ...cat, orden: index + 2 }))
      ]
      
      await updateCategoriasOrden(reorderedCategorias)
    } catch (err) {
      console.error('Error al mover al principio:', err)
    }
  }

  const moveToLast = async (categoria: Categoria) => {
    try {
      // Crear una copia de las categorías ordenadas por orden
      const sortedCategorias = [...categorias].sort((a, b) => a.orden - b.orden)
      
      // Filtrar la categoría a mover
      const otherCategorias = sortedCategorias.filter(cat => cat.id !== categoria.id)
      
      // Crear el nuevo arreglo con la categoría al final
      const reorderedCategorias = [
        ...otherCategorias.map((cat, index) => ({ ...cat, orden: index + 1 })),
        { ...categoria, orden: otherCategorias.length + 1 }
      ]
      
      await updateCategoriasOrden(reorderedCategorias)
    } catch (err) {
      console.error('Error al mover al final:', err)
    }
  }

  const deleteCategoria = async (id: string) => {
    try {
      await CategoriasService.deleteCategoria(id)
      setCategorias(prev => prev.filter(cat => cat.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría')
      throw err
    }
  }

  return {
    categorias,
    loading,
    error,
    createCategoria,
    updateCategoria,
    updateCategoriasOrden,
    moveToFirst,
    moveToLast,
    deleteCategoria,
    refetch: fetchCategorias
  }
}

export function useProductosByCategoria(categoriaId: string | null) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!categoriaId) {
      setProductos([])
      return
    }

    const fetchProductos = async () => {
      try {
        setLoading(true)
        const data = await CategoriasService.getProductosByCategoria(categoriaId)
        setProductos(data)
        setError(null)
      } catch (err) {
        console.error('Error en fetchProductos:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [categoriaId])

  const updateProducto = (productoActualizado: Producto) => {
    setProductos(prev => 
      prev.map(p => p.id === productoActualizado.id ? productoActualizado : p)
    )
  }

  const deleteProducto = (productoId: string) => {
    setProductos(prev => prev.filter(p => p.id !== productoId))
  }

  const refetchProductos = async () => {
    if (!categoriaId) return
    
    try {
      setLoading(true)
      const data = await CategoriasService.getProductosByCategoria(categoriaId)
      setProductos(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return {
    productos,
    loading,
    error,
    updateProducto,
    deleteProducto,
    refetch: refetchProductos
  }
}

export function useProveedores() {
  const [proveedores, setProveedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoading(true)
        const data = await CategoriasService.getProveedores()
        setProveedores(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProveedores()
  }, [])

  return {
    proveedores,
    loading,
    error
  }
}
