import { supabase } from '@/lib/supabase'
import type { Categoria, CategoriaFormData, Producto } from '../data/types'

export class CategoriasService {
  static async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('orden', { ascending: true })
    
    if (error) {
      console.error('Error fetching categorías:', error)
      throw error
    }
    
    return data || []
  }

  static async getNextOrden(): Promise<number> {
    const { data, error } = await supabase
      .from('categorias')
      .select('orden')
      .order('orden', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Error fetching next orden:', error)
      throw error
    }
    
    const maxOrden = data?.[0]?.orden || 0
    return maxOrden + 1
  }

  static async createCategoria(categoriaData: CategoriaFormData): Promise<Categoria> {
    // Obtener el siguiente número de orden disponible
    const nextOrden = await this.getNextOrden()
    
    const { data, error } = await supabase
      .from('categorias')
      .insert({
        ...categoriaData,
        orden: nextOrden
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error al crear categoría:', error)
      throw error
    }
    
    return data
  }

  static async updateCategoria(id: string, categoriaData: Partial<CategoriaFormData>): Promise<Categoria> {
    const { data, error } = await supabase
      .from('categorias')
      .update(categoriaData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error al actualizar categoría:', error)
      throw error
    }
    
    return data
  }

  static async updateCategoriasOrden(categorias: { id: string; orden: number }[]): Promise<void> {
    // Actualizar el orden de múltiples categorías en una transacción
    const updates = categorias.map(({ id, orden }) => 
      supabase
        .from('categorias')
        .update({ orden })
        .eq('id', id)
    )
    
    try {
      await Promise.all(updates)
    } catch (error) {
      console.error('Error actualizando orden de categorías:', error)
      throw error
    }
  }

  static async deleteCategoria(id: string): Promise<void> {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error al eliminar categoría:', error)
      throw error
    }
  }

  static async getProductosByCategoria(categoriaId: string) {
    // Primero intentamos con la relación completa usando foreign key específica
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url),
          usuarios!proveedor_id(id, nombres, apellidos, telefono, rol)
        `)
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error con foreign key específica, intentando relación directa:', err)
    }

    // Si falla, intentamos con relación directa
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url),
          proveedor:usuarios!proveedor_id(id, nombres, apellidos, telefono, rol)
        `)
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error con relación proveedor, intentando sin ella:', err)
    }

    // Si falla, intentamos sin la relación de usuarios
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url)
        `)
        .eq('categoria_id', categoriaId)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error con relación categorias, usando consulta simple:', err)
    }

    // Como último recurso, consulta simple
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('categoria_id', categoriaId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching productos:', error)
      throw error
    }
    
    return data || []
  }

  static async updateProducto(id: string, productoData: Partial<Producto>): Promise<Producto> {
    // Primero intentamos con todas las relaciones
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', id)
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url),
          usuarios!proveedor_id(id, nombres, apellidos, telefono, rol)
        `)
        .single()
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error actualizando con relaciones completas, intentando sin usuarios:', err)
    }

    // Si falla, intentamos sin la relación de usuarios
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', id)
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url)
        `)
        .single()
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error actualizando con categorias, usando consulta simple:', err)
    }

    // Como último recurso, actualización simple
    const { data, error } = await supabase
      .from('productos')
      .update(productoData)
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('Error al actualizar producto:', error)
      throw error
    }
    
    return data
  }

  static async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error al eliminar producto:', error)
      throw error
    }
  }

  static async getProductoById(id: string): Promise<Producto | null> {
    // Intentamos obtener el producto con todas las relaciones
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          categorias!inner(id, nombre, descripcion, imagen_url),
          usuarios(id, nombre, apellido, descripcion, imagen_url)
        `)
        .eq('id', id)
        .single()
      
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('Error obteniendo producto con relaciones completas:', err)
    }

    // Si falla, consulta simple
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching producto:', error)
      throw error
    }
    
    return data
  }

  static async getProveedores() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombres, apellidos, telefono, rol')
      .eq('rol', 'provider')
      .order('nombres', { ascending: true })
    
    if (error) {
      console.error('Error fetching proveedores:', error)
      throw error
    }
    
    return data || []
  }
}
