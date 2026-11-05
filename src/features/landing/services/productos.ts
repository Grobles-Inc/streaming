import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

import type { Producto } from './index'

// Mismo tipo que el resto de la landing (incluye el join `usuarios`).
export type { Producto }

export type ProductoInsert = Database['public']['Tables']['productos']['Insert']
export type ProductoUpdate = Database['public']['Tables']['productos']['Update']



export const getProductosPublicadosByCategoria = async (
  categoriaId: string
): Promise<Producto[]> => {
  return getProductosByCategoria(categoriaId)
}

export const getProductosByCategoria = async (categoriaId: string): Promise<Producto[]> => {
  try {
    // 1. Primero verificar y actualizar productos vencidos
    const resultadoVerificacion = await verificarYActualizarTodosLosProductosVencidos()
    
    if (resultadoVerificacion.error) {
      console.warn('Error en verificación de vencimientos:', resultadoVerificacion.error)
    }

    // 2. Consultar productos por categoría solo si están publicados
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias:categoria_id(nombre),
        usuarios:proveedor_id(nombres, apellidos, billetera_id, usuario)
      `)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'publicado')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching productos:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error en getProductosByCategoria:', error)
    return []
  }
}


// Get producto by ID
export const getProductoById = async (id: string): Promise<Producto | null> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres, usuario)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching producto:', error)
    return null
  }

  return data
}


// Get all productos
export const getProductos = async (): Promise<Producto[]> => {
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      categorias:categoria_id(nombre),
      usuarios:proveedor_id(nombres, usuario)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching productos:', error)
    return []
  }

  return data || []
}

// Get productos publicados (landing, sin paginación)
export const getProductosPublicados = async (): Promise<Producto[]> => {
  try {
    const resultadoVerificacion =
      await verificarYActualizarTodosLosProductosVencidos()

    if (resultadoVerificacion.error) {
      console.warn(
        'Error en verificación de vencimientos:',
        resultadoVerificacion.error
      )
    }

    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias:categoria_id(nombre),
        usuarios:proveedor_id(nombres, apellidos, billetera_id, usuario)
      `)
      .eq('estado', 'publicado')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching productos publicados:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error en getProductosPublicados:', error)
    return []
  }
}

/**
 * Verifica y actualiza automáticamente productos vencidos a estado "borrador"
 * Versión específica para la landing que no está limitada por proveedor
 */
const verificarYActualizarTodosLosProductosVencidos = async (): Promise<{ productosActualizados: number; error?: string }> => {
  try {
    const ahora = new Date().toISOString()
    
    // 1. Buscar productos publicados que ya vencieron (de todos los proveedores)
    const { data: productosVencidos, error: errorBusqueda } = await supabase
      .from('productos')
      .select('id, nombre, fecha_expiracion, proveedor_id')
      .eq('estado', 'publicado')
      .not('fecha_expiracion', 'is', null)
      .lt('fecha_expiracion', ahora)

    if (errorBusqueda) {
      console.error('Error al buscar productos vencidos:', errorBusqueda)
      return { productosActualizados: 0, error: errorBusqueda.message }
    }

    if (!productosVencidos || productosVencidos.length === 0) {
      return { productosActualizados: 0 }
    }

    // 2. Actualizar productos vencidos a estado "borrador"
    const idsProductosVencidos = productosVencidos.map(p => p.id)
    
    const { data: productosActualizados, error: errorActualizacion } = await supabase
      .from('productos')
      .update({ 
        estado: 'borrador',
        updated_at: new Date().toISOString()
      })
      .in('id', idsProductosVencidos)
      .select('id, nombre')

    if (errorActualizacion) {
      console.error('Error al actualizar productos vencidos:', errorActualizacion)
      return { productosActualizados: 0, error: errorActualizacion.message }
    }

    const cantidadActualizada = productosActualizados?.length || 0

    if (cantidadActualizada > 0) {
      console.log(`🔄 Landing: ${cantidadActualizada} producto(s) despublicado(s) automáticamente por vencimiento`)
    }

    return { productosActualizados: cantidadActualizada }
  } catch (error) {
    console.error('Error en verificarYActualizarTodosLosProductosVencidos:', error)
    return { 
      productosActualizados: 0, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}
