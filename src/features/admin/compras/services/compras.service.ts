import { supabase } from '@/lib/supabase'
import type { 
  SupabaseCompra, 
  UpdateCompraData, 
  CompraWithRelations,
  EstadoCompra,
  EstadisticasCompras,
  FiltroCompra
} from '../data/types'

export class ComprasService {
  // Obtener todas las compras con información relacionada
  static async getCompras(filtros?: FiltroCompra): Promise<CompraWithRelations[]> {
    console.log('🔍 ComprasService.getCompras called with filters:', filtros)
    
    let query = supabase
      .from('compras')
      .select(`
        *,
        proveedor:usuarios!compras_proveedor_id_fkey (
          id,
          nombres,
          apellidos,
          telefono
        ),
        producto:productos!compras_producto_id_fkey (
          id,
          nombre,
          descripcion,
          precio_publico,
          imagen_url
        ),
        stock_producto:stock_productos!compras_stock_producto_id_fkey (
          id,
          email,
          clave,
          pin,
          perfil,
          tipo,
          estado
        )
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (filtros?.estado) {
      query = query.eq('estado', filtros.estado)
    }
    
    if (filtros?.fechaDesde) {
      query = query.gte('created_at', filtros.fechaDesde)
    }
    
    if (filtros?.fechaHasta) {
      query = query.lte('created_at', filtros.fechaHasta)
    }
    
    if (filtros?.proveedorId) {
      query = query.eq('proveedor_id', filtros.proveedorId)
    }
    
    if (filtros?.vendedorId) {
      query = query.eq('vendedor_id', filtros.vendedorId)
    }
    
    if (filtros?.productoId) {
      query = query.eq('producto_id', filtros.productoId)
    }

    console.log('📊 Executing query to compras table...')
    const { data, error } = await query

    if (error) {
      console.error('❌ Error fetching compras:', error)
      throw error
    }

    console.log('✅ Raw compras data from Supabase:', {
      count: data?.length || 0,
      sample: data?.slice(0, 2)
    })

    return (data || []).map(compra => ({
      ...compra,
      proveedor: compra.proveedor || null,
      vendedor: compra.vendedor || null,
      producto: compra.producto || null,
      stock_producto: compra.stock_producto || null
    })) as CompraWithRelations[]
  }

  // Obtener compra por ID
  static async getCompraById(id: string): Promise<CompraWithRelations | null> {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        proveedor:usuarios!compras_proveedor_id_fkey (
          id,
          nombres,
          apellidos,
          telefono
        ),
        vendedor:usuarios!compras_vendedor_id_fkey (
          id,
          nombres,
          apellidos,
          telefono
        ),
        producto:productos!compras_producto_id_fkey (
          id,
          nombre,
          descripcion,
          precio_publico,
          imagen_url
        ),
        stock_producto:stock_productos!compras_stock_producto_id_fkey (
          id,
          email,
          clave,
          pin,
          perfil,
          tipo,
          estado
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Compra no encontrada
      }
      console.error('Error fetching compra by ID:', error)
      throw error
    }

    return {
      ...data,
      proveedor: data.proveedor || null,
      vendedor: data.vendedor || null,
      producto: data.producto || null,
      stock_producto: data.stock_producto || null
    } as CompraWithRelations
  }

  // Actualizar compra
  static async updateCompra(id: string, updates: UpdateCompraData): Promise<SupabaseCompra> {
    const { data, error } = await supabase
      .from('compras')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating compra:', error)
      throw error
    }

    return data as SupabaseCompra
  }

  // Cambiar estado de compra con lógica especial para reembolsos
  static async cambiarEstadoCompra(id: string, nuevoEstado: EstadoCompra): Promise<{
    compra: SupabaseCompra
    reembolsoProcessed?: boolean
    reembolsoAmount?: number
  }> {
    // Primero obtener la compra para verificar datos
    const compraActual = await this.getCompraById(id)
    if (!compraActual) {
      throw new Error('Compra no encontrada')
    }

    // Si el nuevo estado es "reembolsado", procesar el reembolso
    if (nuevoEstado === 'reembolsado' && compraActual.monto_reembolso > 0) {
      console.log(`💰 Processing refund of ${compraActual.monto_reembolso} for vendedor ${compraActual.vendedor_id}`)
      
      // Usar una transacción para actualizar la compra y el balance del vendedor
      const { data: compraUpdated, error: compraError } = await supabase
        .from('compras')
        .update({
          estado: nuevoEstado,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single()

      if (compraError) {
        console.error('Error updating compra status:', compraError)
        throw compraError
      }

      // Actualizar el balance del vendedor (quien hizo la compra)
      const { error: balanceError } = await supabase.rpc('increment_user_balance', {
        user_id: compraActual.vendedor_id,
        amount: compraActual.monto_reembolso
      })

      if (balanceError) {
        console.error('Error updating user balance:', balanceError)
        // Si hay error con el balance, revertir el estado de la compra
        await supabase
          .from('compras')
          .update({
            estado: compraActual.estado,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
        
        throw new Error('Error procesando el reembolso. El estado de la compra no se ha cambiado.')
      }

      console.log(`✅ Refund processed successfully: ${compraActual.monto_reembolso} returned to user ${compraActual.vendedor_id}`)
      
      return {
        compra: compraUpdated as SupabaseCompra,
        reembolsoProcessed: true,
        reembolsoAmount: compraActual.monto_reembolso
      }
    } else {
      // Cambio de estado normal sin reembolso
      const compraUpdated = await this.updateCompra(id, { estado: nuevoEstado })
      return {
        compra: compraUpdated,
        reembolsoProcessed: false
      }
    }
  }

  // Métodos específicos para cada estado
  static async marcarComoResuelto(id: string) {
    return this.cambiarEstadoCompra(id, 'resuelto')
  }

  static async marcarComoVencido(id: string) {
    return this.cambiarEstadoCompra(id, 'vencido')
  }

  static async enviarASoporte(id: string) {
    return this.cambiarEstadoCompra(id, 'soporte')
  }

  static async procesarReembolso(id: string) {
    return this.cambiarEstadoCompra(id, 'reembolsado')
  }

  static async marcarComoPedidoEntregado(id: string) {
    return this.cambiarEstadoCompra(id, 'pedido_entregado')
  }

  // Obtener estadísticas de compras
  static async getEstadisticas(): Promise<EstadisticasCompras> {
    const { data, error } = await supabase
      .from('compras')
      .select('precio, estado, monto_reembolso')

    if (error) {
      console.error('Error fetching compras statistics:', error)
      throw error
    }

    const compras = data || []
    
    const estadisticas: EstadisticasCompras = {
      total: compras.length,
      resueltas: compras.filter(c => c.estado === 'resuelto').length,
      vencidas: compras.filter(c => c.estado === 'vencido').length,
      soporte: compras.filter(c => c.estado === 'soporte').length,
      reembolsadas: compras.filter(c => c.estado === 'reembolsado').length,
      pedidoEntregado: compras.filter(c => c.estado === 'pedido_entregado').length,
      ingresoTotal: compras.reduce((sum, c) => sum + (c.precio || 0), 0),
      ingresoResuelto: compras.filter(c => c.estado === 'resuelto').reduce((sum, c) => sum + (c.precio || 0), 0),
      montoReembolsado: compras.filter(c => c.estado === 'reembolsado').reduce((sum, c) => sum + (c.monto_reembolso || 0), 0),
    }

    return estadisticas
  }

  // Cambiar estado masivo
  static async cambiarEstadoMasivo(ids: string[], nuevoEstado: EstadoCompra): Promise<{
    success: number
    failed: number
    reembolsoTotal?: number
  }> {
    let successCount = 0
    let failedCount = 0
    let reembolsoTotal = 0

    for (const id of ids) {
      try {
        const result = await this.cambiarEstadoCompra(id, nuevoEstado)
        successCount++
        if (result.reembolsoProcessed && result.reembolsoAmount) {
          reembolsoTotal += result.reembolsoAmount
        }
      } catch (error) {
        console.error(`Failed to update compra ${id}:`, error)
        failedCount++
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      reembolsoTotal: reembolsoTotal > 0 ? reembolsoTotal : undefined
    }
  }
}
