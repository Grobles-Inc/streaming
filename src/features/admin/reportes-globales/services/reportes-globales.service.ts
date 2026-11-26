import { supabase } from '@/lib/supabase'
import type { Usuario, Producto, Recarga, MetricasGlobales } from '../data/types'

export class ReportesGlobalesService {
  // Usuarios
  static async getUsuarios(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, nombres, apellidos, usuario, password, billetera_id, codigo_referido, referido_id, telefono, rol, created_at, updated_at, estado_habilitado')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching usuarios:', error)
      throw error
    }
    
    return (data || []) as unknown as Usuario[]
  }

  static async updateUsuario(id: string, updates: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select('id, email, nombres, apellidos, usuario, password, billetera_id, codigo_referido, referido_id, telefono, rol, created_at, updated_at, estado_habilitado')
      .single()
    
    if (error) {
      console.error('Error updating usuario:', error)
      throw error
    }
    
    return data as unknown as Usuario
  }

  static async deleteUsuario(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting usuario:', error)
      throw error
    }
  }

  // Productos con nombres de proveedor y categoría
  static async getProductos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        id, proveedor_id, created_at, updated_at, nombre, precio_publico, precio_vendedor, precio_renovacion, categoria_id, tiempo_uso, duracion_cartel_dias, nuevo, disponibilidad, renovable, descripcion, informacion, condiciones, imagen_url, descripcion_completa, solicitud, muestra_disponibilidad_stock, deshabilitar_boton_comprar, estado, fecha_expiracion, stock_de_productos,
        categorias(id, nombre),
        usuarios!proveedor_id(nombres, apellidos, usuario)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching productos with relations:', error)
      
      // Fallback: obtener datos básicos y luego enriquecer
      const { data: simpleData, error: simpleError } = await supabase
        .from('productos')
        .select('id, proveedor_id, created_at, updated_at, nombre, precio_publico, precio_vendedor, precio_renovacion, categoria_id, tiempo_uso, duracion_cartel_dias, nuevo, disponibilidad, renovable, descripcion, informacion, condiciones, imagen_url, descripcion_completa, solicitud, muestra_disponibilidad_stock, deshabilitar_boton_comprar, estado, fecha_expiracion, stock_de_productos')
        .order('created_at', { ascending: false })
      
      if (simpleError) {
        console.error('Error fetching productos (simple):', simpleError)
        throw simpleError
      }
      
      return (simpleData || []) as unknown as Producto[]
    }
    
    return (data || []) as unknown as Producto[]
  }

  static async updateProducto(id: string, updates: Partial<Producto>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select('id, proveedor_id, created_at, updated_at, nombre, precio_publico, precio_vendedor, precio_renovacion, categoria_id, tiempo_uso, duracion_cartel_dias, nuevo, disponibilidad, renovable, descripcion, informacion, condiciones, imagen_url, descripcion_completa, solicitud, muestra_disponibilidad_stock, deshabilitar_boton_comprar, estado, fecha_expiracion, stock_de_productos')
      .single()
    
    if (error) {
      console.error('Error updating producto:', error)
      throw error
    }
    
    return data as unknown as Producto
  }

  // Recargas con nombres de usuario
  static async getRecargas(): Promise<Recarga[]> {
    const { data, error } = await supabase
      .from('recargas')
      .select(`
        *,
        usuarios!usuario_id(nombres, apellidos, usuario)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching recargas with relations:', error)
      
      // Fallback: obtener datos básicos y enriquecer manualmente
      const { data: simpleData, error: simpleError } = await supabase
        .from('recargas')
        .select('created_at, estado, id, monto, revisado_id, updated_at, usuario_id')
        .order('created_at', { ascending: false })
      
      if (simpleError) {
        console.error('Error fetching recargas (simple):', simpleError)
        throw simpleError
      }
      
      // Enriquecer con datos de usuario
      if (simpleData) {
        const enrichedData = await Promise.all(
          simpleData.map(async (recarga) => {
            const { data: usuario } = await supabase
              .from('usuarios')
              .select('usuario, nombres, apellidos')
              .eq('id', recarga.usuario_id)
              .single()
            
            return {
              ...recarga,
              usuarios: usuario
            }
          })
        )
        return enrichedData.filter(r => r !== null) as unknown as Recarga[]
      }
      
      return []
    }
    
    return data || []
  }

  // Obtener información de usuario para una recarga específica
  static async getUsuarioForRecarga(usuarioId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, usuario, nombres, apellidos, email, rol')
      .eq('id', usuarioId)
      .single()
    
    if (error) {
      console.error('Error fetching usuario for recarga:', error)
      return null
    }
    
    return data
  }

  static async updateRecarga(id: string, estado: 'aprobado' | 'pendiente' | 'rechazado'): Promise<Recarga> {
    // Actualizar sin relación para evitar errores
    const { data, error } = await supabase
      .from('recargas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('created_at, estado, id, monto, revisado_id, updated_at, usuario_id')
      .single()
    
    if (error) {
      console.error('Error updating recarga:', error)
      throw error
    }
    
    return data
  }

  // Métricas globales
  static async getMetricasGlobales(): Promise<MetricasGlobales> {
    try {
      // Obtener conteos simples en paralelo
      const [usuariosResult, productosResult, recargasResult, archivoResult] =
        await Promise.all([
          supabase.from('usuarios').select('rol', { count: 'exact' }),
          supabase.from('productos').select('categoria_id', { count: 'exact' }),
          supabase.from('recargas').select('monto, estado', { count: 'exact' }),
          supabase
            .from('contabilidad_archivo')
            .select('filas_recargas, recargas_aprobadas, recargas_por_estado'),
        ])

      const usuarios = usuariosResult.data || []
      const productos = productosResult.data || []
      const recargas = recargasResult.data || []

      if (archivoResult.error) {
        console.error(
          'Error fetching contabilidad_archivo:',
          archivoResult.error
        )
      }

      const archivo = archivoResult.data || []

      // Calcular métricas básicas
      const usuariosPorRol = usuarios.reduce((acc, u) => {
        const rol = u.rol as keyof typeof acc
        acc[rol] = (acc[rol] || 0) + 1
        return acc
      }, { admin: 0, provider: 0, seller: 0 })

      const recargasPorEstado = recargas.reduce((acc, r) => {
        const estado = r.estado as keyof typeof acc
        acc[estado] = (acc[estado] || 0) + 1
        return acc
      }, { aprobado: 0, pendiente: 0, rechazado: 0 })

      const montoTotalRecargado = recargas
        .filter(r => r.estado === 'aprobado')
        .reduce((sum, r) => sum + (r.monto || 0), 0)

      // Totales archivados por purgas anteriores
      const archivoFilas = archivo.reduce(
        (sum, a) => sum + (a.filas_recargas ?? 0),
        0
      )
      const archivoAprobadas = archivo.reduce(
        (sum, a) => sum + Number(a.recargas_aprobadas ?? 0),
        0
      )
      const archivoPorEstado = archivo.reduce(
        (acc, a) => {
          const counts = (a.recargas_por_estado ?? {}) as Record<string, number>
          for (const [estado, total] of Object.entries(counts)) {
            if (estado in acc) {
              acc[estado as keyof typeof acc] += Number(total)
            }
          }
          return acc
        },
        { aprobado: 0, pendiente: 0, rechazado: 0 }
      )

      // Productos por categoría (usando IDs por simplicidad)
      const productosPorCategoria = productos.reduce((acc, p) => {
        const categoria = p.categoria_id || 'Sin categoría'
        const existing = acc.find(item => item.categoria === categoria)
        if (existing) {
          existing.cantidad++
        } else {
          acc.push({ categoria, cantidad: 1 })
        }
        return acc
      }, [] as Array<{ categoria: string; cantidad: number }>)

      return {
        totalUsuarios: usuariosResult.count || 0,
        totalProductos: productosResult.count || 0,
        totalRecargas: (recargasResult.count || 0) + archivoFilas,
        montoTotalRecargado: montoTotalRecargado + archivoAprobadas,
        recargasArchivadas: archivoFilas,
        montoRecargasArchivadas: archivoAprobadas,
        usuariosPorRol,
        productosPorCategoria,
        recargasPorEstado: {
          aprobado: recargasPorEstado.aprobado + archivoPorEstado.aprobado,
          pendiente: recargasPorEstado.pendiente + archivoPorEstado.pendiente,
          rechazado: recargasPorEstado.rechazado + archivoPorEstado.rechazado,
        },
      }
    } catch (error) {
      console.error('Error fetching métricas globales:', error)
      
      // Retornar métricas vacías en caso de error
      return {
        totalUsuarios: 0,
        totalProductos: 0,
        totalRecargas: 0,
        montoTotalRecargado: 0,
        recargasArchivadas: 0,
        montoRecargasArchivadas: 0,
        usuariosPorRol: { admin: 0, provider: 0, seller: 0 },
        productosPorCategoria: [],
        recargasPorEstado: { aprobado: 0, pendiente: 0, rechazado: 0 }
      }
    }
  }
}
