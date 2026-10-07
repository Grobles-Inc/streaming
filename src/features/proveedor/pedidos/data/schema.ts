import { z } from 'zod'

const pedidoEstadoSchema = z.union([
  z.literal('resuelto'),
  z.literal('soporte'),
  z.literal('vencido'),
  z.literal('pedido'),
  z.literal('entregado'),
  z.literal('renovado'),
])

/**
 * Fila devuelta por el RPC `get_pedidos_proveedor`.
 * Los joins vienen aplanados (producto_*, vendedor_*, cuenta_*) y las columnas
 * calculadas por el servidor (`estado_calculado`, `dias_restantes`, `total_count`)
 * ya no se derivan en el cliente.
 */
export const pedidoSchema = z.object({
  // compras
  id: z.number(),
  proveedor_id: z.string(),
  producto_id: z.number(),
  vendedor_id: z.string().nullable(),
  stock_producto_id: z.number().nullable(),
  precio: z.number(),
  fecha_inicio: z.string().nullable(),
  fecha_expiracion: z.string().nullable(),
  estado: z.string(),
  nombre_cliente: z.string(),
  telefono_cliente: z.string(),
  soporte_mensaje: z.string().nullable(),
  soporte_asunto: z.string().nullable(),
  soporte_respuesta: z.string().nullable(),
  monto_reembolso: z.number().nullable(),
  created_at: z.string(),
  renovado: z.boolean(),
  // join productos
  producto_nombre: z.string().nullable(),
  producto_precio_publico: z.number().nullable(),
  producto_precio_renovacion: z.number().nullable(),
  producto_tiempo_uso: z.number().nullable(),
  // join usuarios (vendedor)
  vendedor_usuario: z.string().nullable(),
  vendedor_nombres: z.string().nullable(),
  vendedor_apellidos: z.string().nullable(),
  vendedor_telefono: z.string().nullable(),
  // join stock_productos
  cuenta_id: z.number().nullable(),
  cuenta_email: z.string().nullable(),
  cuenta_clave: z.string().nullable(),
  cuenta_pin: z.string().nullable(),
  cuenta_perfil: z.string().nullable(),
  cuenta_url: z.string().nullable(),
  soporte_stock_producto: z.string().nullable(),
  // calculadas en el servidor
  estado_calculado: z.string(),
  dias_restantes: z.number().nullable(),
  total_count: z.number(),
})

export type PedidoEstado = z.infer<typeof pedidoEstadoSchema>
export type Pedido = z.infer<typeof pedidoSchema>