import { supabase } from '@/lib/supabase'
import type { 
  SupabaseProducto, 
  CreateProductoData,
  UpdateProductoData, 
  ProductoWithRelations,
  EstadoProducto,
  EstadisticasProductos,
  FiltroProducto
} from '../data/types'

export class ProductosService {
  // Obtener todos los productos con información relacionada
  static async getProductos(filtros?: FiltroProducto): Promise<ProductoWithRelations[]> {
    
    let query = supabase
      .from('productos')
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        ),
        usuarios!proveedor_id (
          id,
          usuario,
          nombres,
          apellidos,
          email
        )
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }
    
    if (filtros?.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id)
    }
    
    if (filtros?.proveedor_id) {
      query = query.eq('proveedor_id', filtros.proveedor_id)
    }
    
    if (filtros?.disponibilidad) {
      query = query.eq('disponibilidad', filtros.disponibilidad)
    }
    
    if (filtros?.nuevo !== undefined) {
      query = query.eq('nuevo', filtros.nuevo)
    }
    
    

    if (filtros?.busqueda) {
      query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching productos:', error)
      throw error
    }

    

    return (data || []).map(producto => ({
      ...producto,
      categoria: producto.categorias || null,
      proveedor: producto.usuarios || null,
      stock_productos: producto.stock_productos || []
    })) as ProductoWithRelations[]
  }

  // Obtener producto por ID
  static async getProductoById(id: number): Promise<ProductoWithRelations | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias!categoria_id (
          id,
          nombre,
          descripcion
        ),
        usuarios!proveedor_id (
          id,
          usuario,
          nombres,
          apellidos,
          email
        ),
        stock_productos!producto_id (
          id,
          estado
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Producto no encontrado
      }
      throw error
    }

    return {
      ...data,
      categoria: data.categorias || null,
      proveedor: data.usuarios || null,
      stock_productos: data.stock_productos || []
    } as ProductoWithRelations
  }

  // Crear un nuevo producto
  static async createProducto(productoData: CreateProductoData): Promise<SupabaseProducto> {
    const { data, error } = await supabase
      .from('productos')
      .insert(productoData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating producto:', error)
      throw error
    }

    return data as SupabaseProducto
  }

  // Actualizar un producto
  static async updateProducto(id: number, productoData: Partial<UpdateProductoData>): Promise<SupabaseProducto> {
    const { data, error } = await supabase
      .from('productos')
      .update({
        ...productoData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating producto:', error)
      throw error
    }

    return data as SupabaseProducto
  }

  // Eliminar un producto
  static async deleteProducto(id: number): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting producto:', error)
      throw error
    }
  }

  // Cambiar estado de un producto
  static async cambiarEstadoProducto(id: number, nuevoEstado: EstadoProducto): Promise<SupabaseProducto> {
    if (nuevoEstado === 'publicado') {
      throw new Error('Solo el proveedor puede publicar productos')
    }

    return this.updateProducto(id, { estado: nuevoEstado })
  }

  // Duplicar un producto
  static async duplicarProducto(id: number): Promise<SupabaseProducto> {
    const productoOriginal = await this.getProductoById(id)
    if (!productoOriginal) {
      throw new Error('Producto no encontrado')
    }

    const nuevoProducto: CreateProductoData = {
      nombre: `${productoOriginal.nombre} (Copia)`,
      descripcion: productoOriginal.descripcion,
      informacion: productoOriginal.informacion,
      condiciones: productoOriginal.condiciones,
      precio_publico: productoOriginal.precio_publico,
      categoria_id: productoOriginal.categoria_id,
      proveedor_id: productoOriginal.proveedor_id,
      imagen_url: productoOriginal.imagen_url,
      tiempo_uso: productoOriginal.tiempo_uso,
      duracion_cartel_dias: productoOriginal.duracion_cartel_dias,
      nuevo: false, // No es nuevo al duplicar

      descripcion_completa: productoOriginal.descripcion_completa,
      disponibilidad: productoOriginal.disponibilidad,
      renovable: productoOriginal.renovable,
      solicitud: productoOriginal.solicitud,
      muestra_disponibilidad_stock: productoOriginal.muestra_disponibilidad_stock,
      deshabilitar_boton_comprar: productoOriginal.deshabilitar_boton_comprar,
      precio_vendedor: productoOriginal.precio_vendedor,
      precio_renovacion: productoOriginal.precio_renovacion,
      estado: 'borrador' // Empezar como borrador
    }

    return this.createProducto(nuevoProducto)
  }

  // Obtener estadísticas de productos
  static async getEstadisticasProductos(): Promise<EstadisticasProductos> {
    const { data, error } = await supabase
      .from('productos')
      .select('estado, disponibilidad, nuevo')

    if (error) {
      console.error('❌ Error fetching productos statistics:', error)
      throw error
    }

    const productos = data || []
    
    return {
      total: productos.length,
      publicados: productos.filter(p => p.estado === 'publicado').length,
      borradores: productos.filter(p => p.estado === 'borrador').length,
      enStock: productos.filter(p => p.disponibilidad === 'en_stock').length,
      aPedido: productos.filter(p => p.disponibilidad === 'a_pedido').length,
      activacion: productos.filter(p => p.disponibilidad === 'activacion').length,
      nuevos: productos.filter(p => p.nuevo).length,
    }
  }

  // Obtener categorías para filtros
  static async getCategorias() {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre')

    if (error) {
      console.error('❌ Error fetching categorias:', error)
      throw error
    }

    return data || []
  }

  // Obtener proveedores para filtros
  static async getProveedores() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario')
      .eq('rol', 'provider')
      .order('usuario')

    if (error) {
      console.error('❌ Error fetching proveedores:', error)
      throw error
    }

    return data || []
  }
}
