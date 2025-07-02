import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SoporteCompra, SoporteEstado } from '../soporte-page'

// Query para obtener casos de soporte por proveedor
export function useSoporteByProveedor(proveedorId: string) {
  return useQuery({
    queryKey: ['soporte', 'proveedor', proveedorId],
    queryFn: async (): Promise<SoporteCompra[]> => {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          *,
          productos:producto_id (
            nombre,
            precio_publico
          ),
          usuarios:vendedor_id (
            nombres,
            apellidos,
            telefono
          ),
          stock_productos:stock_producto_id (
            id,
            soporte_stock_producto,
            email,
            clave,
            perfil
          )
        `)
        .eq('proveedor_id', proveedorId)
        .not('soporte_mensaje', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching soporte cases:', error)
        throw error
      }

      return data || []
    },
    enabled: !!proveedorId,
  })
}

// Query para obtener estadísticas de soporte
export function useSoporteStats(proveedorId: string) {
  return useQuery({
    queryKey: ['soporte', 'stats', proveedorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          id,
          stock_productos:stock_producto_id (
            soporte_stock_producto
          )
        `)
        .eq('proveedor_id', proveedorId)
        .not('soporte_mensaje', 'is', null)

      if (error) {
        console.error('Error fetching soporte stats:', error)
        throw error
      }

      const stats = {
        total: data?.length || 0,
        activos: 0,
        enSoporte: 0,
        resueltos: 0,
      }

      data?.forEach((item) => {
        const estado = item.stock_productos?.[0]?.soporte_stock_producto
        if (estado === 'activo') stats.activos++
        else if (estado === 'soporte') stats.enSoporte++
        else if (estado === 'resuelto') stats.resueltos++
      })

      return stats
    },
    enabled: !!proveedorId,
  })
}

// Mutación para actualizar el estado de soporte
export function useUpdateSoporteStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      stockProductoId,
      estado,
      respuesta,
    }: {
      stockProductoId: number
      estado: SoporteEstado
      respuesta?: string
    }) => {
      // Actualizar el estado en stock_productos
      const { error: stockError } = await supabase
        .from('stock_productos')
        .update({
          soporte_stock_producto: estado,
        })
        .eq('id', stockProductoId)

      if (stockError) {
        console.error('Error updating stock_productos:', stockError)
        throw stockError
      }

      // Si hay respuesta, actualizar la tabla compras con la respuesta del proveedor
      if (respuesta) {
        const { error: compraError } = await supabase
          .from('compras')
          .update({
            soporte_respuesta: respuesta,
            updated_at: new Date().toISOString(),
          })
          .eq('stock_producto_id', stockProductoId)

        if (compraError) {
          console.error('Error updating compras:', compraError)
          throw compraError
        }
      }

      return { success: true }
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['soporte'] })
    },
  })
}

// Mutación para marcar como resuelto
export function useMarcarComoResuelto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stockProductoId: number) => {
      const { error } = await supabase
        .from('stock_productos')
        .update({
          soporte_stock_producto: 'resuelto',
        })
        .eq('id', stockProductoId)

      if (error) {
        console.error('Error marking as resolved:', error)
        throw error
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soporte'] })
    },
  })
}

// Query para obtener un caso específico de soporte
export function useSoporteCase(compraId: string) {
  return useQuery({
    queryKey: ['soporte', 'case', compraId],
    queryFn: async (): Promise<SoporteCompra | null> => {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          *,
          productos:producto_id (
            nombre,
            precio_publico
          ),
          usuarios:vendedor_id (
            nombres,
            apellidos,
            telefono
          ),
          stock_productos:stock_producto_id (
            id,
            soporte_stock_producto,
            email,
            clave,
            perfil
          )
        `)
        .eq('id', compraId)
        .single()

      if (error) {
        console.error('Error fetching soporte case:', error)
        throw error
      }

      return data
    },
    enabled: !!compraId,
  })
} 