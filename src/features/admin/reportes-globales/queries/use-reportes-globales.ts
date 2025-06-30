import { useState, useEffect } from 'react'
import { ReportesGlobalesService } from '../services'
import type { Usuario, Producto, Recarga, MetricasGlobales } from '../data/types'

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        setLoading(true)
        const data = await ReportesGlobalesService.getUsuarios()
        // Filtrar usuarios con datos válidos
        const validUsuarios = data.filter(usuario => 
          usuario && 
          usuario.id && 
          usuario.nombres && 
          usuario.apellidos &&
          usuario.created_at
        )
        setUsuarios(validUsuarios)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])

  const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
    try {
      const updatedUsuario = await ReportesGlobalesService.updateUsuario(id, updates)
      setUsuarios(prev => prev.map(u => u.id === id ? updatedUsuario : u))
      return updatedUsuario
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario')
      throw err
    }
  }

  const deleteUsuario = async (id: string) => {
    try {
      await ReportesGlobalesService.deleteUsuario(id)
      setUsuarios(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario')
      throw err
    }
  }

  return {
    usuarios,
    loading,
    error,
    updateUsuario,
    deleteUsuario,
    refetch: () => {
      setLoading(true)
      setError(null)
      ReportesGlobalesService.getUsuarios()
        .then(data => {
          const validUsuarios = data.filter(usuario => 
            usuario && 
            usuario.id && 
            usuario.nombres && 
            usuario.apellidos &&
            usuario.created_at
          )
          setUsuarios(validUsuarios)
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
        .finally(() => setLoading(false))
    }
  }
}

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true)
        const data = await ReportesGlobalesService.getProductos()
        // Filtrar productos con datos válidos
        const validProductos = data.filter(producto => 
          producto && 
          producto.id && 
          producto.nombre &&
          typeof producto.precio_publico === 'number' &&
          typeof producto.precio_vendedor === 'number'
        )
        setProductos(validProductos)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [])

  const updateProducto = async (id: string, updates: Partial<Producto>) => {
    try {
      const updatedProducto = await ReportesGlobalesService.updateProducto(id, updates)
      setProductos(prev => prev.map(p => p.id === id ? updatedProducto : p))
      return updatedProducto
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto')
      throw err
    }
  }

  return {
    productos,
    loading,
    error,
    updateProducto,
    refetch: () => {
      setLoading(true)
      setError(null)
      ReportesGlobalesService.getProductos()
        .then(data => {
          const validProductos = data.filter(producto => 
            producto && 
            producto.id && 
            producto.nombre &&
            typeof producto.precio_publico === 'number' &&
            typeof producto.precio_vendedor === 'number'
          )
          setProductos(validProductos)
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
        .finally(() => setLoading(false))
    }
  }
}

export function useRecargas() {
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecargas = async () => {
      try {
        setLoading(true)
        const data = await ReportesGlobalesService.getRecargas()
        // Filtrar recargas con datos válidos
        const validRecargas = data.filter(recarga => 
          recarga && 
          recarga.id && 
          recarga.usuario_id &&
          typeof recarga.monto === 'number' &&
          recarga.estado
        )
        setRecargas(validRecargas)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchRecargas()
  }, [])

  const updateRecarga = async (id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      const updatedRecarga = await ReportesGlobalesService.updateRecarga(id, estado)
      setRecargas(prev => prev.map(r => r.id === id ? updatedRecarga : r))
      return updatedRecarga
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar recarga')
      throw err
    }
  }

  return {
    recargas,
    loading,
    error,
    updateRecarga,
    refetch: () => {
      setLoading(true)
      setError(null)
      ReportesGlobalesService.getRecargas()
        .then(data => {
          const validRecargas = data.filter(recarga => 
            recarga && 
            recarga.id && 
            recarga.usuario_id &&
            typeof recarga.monto === 'number' &&
            recarga.estado
          )
          setRecargas(validRecargas)
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
        .finally(() => setLoading(false))
    }
  }
}

export function useMetricasGlobales() {
  const [metricas, setMetricas] = useState<MetricasGlobales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setLoading(true)
        const data = await ReportesGlobalesService.getMetricasGlobales()
        setMetricas(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchMetricas()
  }, [])

  return {
    metricas,
    loading,
    error,
    refetch: () => {
      setLoading(true)
      setError(null)
      ReportesGlobalesService.getMetricasGlobales()
        .then(setMetricas)
        .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
        .finally(() => setLoading(false))
    }
  }
}
