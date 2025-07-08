import { supabase } from '@/lib/supabase'
import { getBilleteraByUsuarioId, updateBilleteraSaldo } from '@/services'
import { ConfiguracionService } from '@/features/admin/configuracion-sistema/services/configuracion.service'
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
      .eq('estado', 'publicado') // Solo mostrar productos publicados
      .order('created_at', { ascending: false })

    // Aplicar filtros adicionales (el estado ya está fijo a 'publicado')
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
  static async getProductoById(id: number): Promise<ProductoWithRelations | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categoria:categorias!categoria_id (
          id,
          nombre,
          descripcion
        ),
        proveedor:usuarios!proveedor_id (
          id,
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
    // Obtener el producto actual para verificar el estado anterior
    const productoActual = await this.getProductoById(id)
    if (!productoActual) {
      throw new Error('Producto no encontrado')
    }

    // Si el cambio es de "borrador" a "publicado", procesar comisión
    if (productoActual.estado === 'borrador' && nuevoEstado === 'publicado') {
      await this.procesarComisionPublicacion(productoActual)
    }

    return this.updateProducto(id, { estado: nuevoEstado })
  }

  // Procesar comisión de publicación
  private static async procesarComisionPublicacion(producto: SupabaseProducto): Promise<void> {
    try {
      console.log('🔄 Procesando comisión de publicación para producto:', producto.id)

      // 1. Obtener la configuración actual del sistema
      const configuracion = await ConfiguracionService.getLatestConfiguracion()
      if (!configuracion) {
        throw new Error('No se pudo obtener la configuración del sistema')
      }

      const comisionPublicacion = configuracion.comision_publicacion_producto

      // 2. Obtener la billetera del proveedor
      const billeteraProveedor = await getBilleteraByUsuarioId(producto.proveedor_id)
      if (!billeteraProveedor) {
        throw new Error('No se encontró la billetera del proveedor')
      }

      // 3. Verificar que el proveedor tenga saldo suficiente
      if (billeteraProveedor.saldo < comisionPublicacion) {
        throw new Error(`Saldo insuficiente. Se requieren $${comisionPublicacion} para publicar el producto`)
      }

      // 4. Obtener el usuario administrador (primer admin en la tabla)
      const { data: adminUser, error: adminError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('rol', 'admin')
        .limit(1)
        .single()

      if (adminError || !adminUser) {
        throw new Error('No se encontró un usuario administrador')
      }

      // 5. Obtener la billetera del administrador
      const billeteraAdmin = await getBilleteraByUsuarioId(adminUser.id)
      if (!billeteraAdmin) {
        throw new Error('No se encontró la billetera del administrador')
      }

      // 6. Realizar las transacciones de billetera
      const nuevoSaldoProveedor = billeteraProveedor.saldo - comisionPublicacion
      const nuevoSaldoAdmin = billeteraAdmin.saldo + comisionPublicacion

      // Actualizar saldo del proveedor
      const proveedorActualizado = await updateBilleteraSaldo(billeteraProveedor.id, nuevoSaldoProveedor)
      if (!proveedorActualizado) {
        throw new Error('Error al actualizar el saldo del proveedor')
      }

      // Actualizar saldo del administrador
      const adminActualizado = await updateBilleteraSaldo(billeteraAdmin.id, nuevoSaldoAdmin)
      if (!adminActualizado) {
        // Revertir el cambio del proveedor si falla la actualización del admin
        await updateBilleteraSaldo(billeteraProveedor.id, billeteraProveedor.saldo)
        throw new Error('Error al actualizar el saldo del administrador')
      }

      console.log('✅ Comisión de publicación procesada exitosamente:', {
        producto: producto.id,
        comision: comisionPublicacion,
        proveedorAntes: billeteraProveedor.saldo,
        proveedorDespues: nuevoSaldoProveedor,
        adminAntes: billeteraAdmin.saldo,
        adminDespues: nuevoSaldoAdmin
      })

    } catch (error) {
      console.error('❌ Error al procesar comisión de publicación:', error)
      throw error
    }
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
      a_pedido: productoOriginal.a_pedido,
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
