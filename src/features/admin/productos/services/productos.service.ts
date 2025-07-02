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
    console.log('🔍 ProductosService.getProductos called with filters:', filtros)
    
    let query = supabase
      .from('productos')
      .select(`
        *,
        categorias (
          id,
          nombre,
          descripcion
        ),
        usuarios (
          id,
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
    
    if (filtros?.destacado !== undefined) {
      query = query.eq('destacado', filtros.destacado)
    }
    
    if (filtros?.mas_vendido !== undefined) {
      query = query.eq('mas_vendido', filtros.mas_vendido)
    }

    if (filtros?.busqueda) {
      query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
    }

    console.log('📊 Executing query to productos table...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching productos:', error)
      throw error
    }

    console.log('✅ Raw productos data from Supabase:', {
      count: data?.length || 0,
      sample: data?.slice(0, 2)
    })

    return (data || []).map(producto => ({
      ...producto,
      categoria: producto.categoria || null,
      proveedor: producto.proveedor || null,
      stock_productos: producto.stock_productos || []
    })) as ProductoWithRelations[]
  }

  // Obtener producto por ID
  static async getProductoById(id: string): Promise<ProductoWithRelations | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias!productos_categoria_id_fkey (
          id,
          nombre,
          descripcion
        ),
        proveedor:usuarios!productos_proveedor_id_fkey (
          id,
          nombres,
          apellidos,
          email
        ),
        stock_productos!productos_stock_producto_id_fkey (
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
      categoria: data.categoria || null,
      proveedor: data.proveedor || null,
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
  static async updateProducto(id: string, productoData: Partial<UpdateProductoData>): Promise<SupabaseProducto> {
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
  static async deleteProducto(id: string): Promise<void> {
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
  static async cambiarEstadoProducto(id: string, nuevoEstado: EstadoProducto): Promise<SupabaseProducto> {
    return this.updateProducto(id, { estado: nuevoEstado })
  }

  // Duplicar un producto
  static async duplicarProducto(id: string): Promise<SupabaseProducto> {
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
      stock: 0, // Empezar con stock 0
      categoria_id: productoOriginal.categoria_id,
      proveedor_id: productoOriginal.proveedor_id,
      imagen_url: productoOriginal.imagen_url,
      tiempo_uso: productoOriginal.tiempo_uso,
      a_pedido: productoOriginal.a_pedido,
      nuevo: false, // No es nuevo al duplicar
      destacado: false, // No está destacado al duplicar
      mas_vendido: false, // No es más vendido al duplicar
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
      .select('estado, disponibilidad, nuevo, destacado, mas_vendido')

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
      destacados: productos.filter(p => p.destacado).length,
      masVendidos: productos.filter(p => p.mas_vendido).length,
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
      .select('id, nombres, apellidos')
      .eq('rol', 'provider')
      .order('nombres')

    if (error) {
      console.error('❌ Error fetching proveedores:', error)
      throw error
    }

    return data || []
  }
}
