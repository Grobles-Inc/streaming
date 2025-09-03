import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.

const compraEstadoSchema = z.union([
  z.literal('resuelto'),
  z.literal('soporte'),
  z.literal('vencido'),
  z.literal('pedido'),
  z.literal('entregado'),
  z.literal('reembolsado')
  z.literal('renovado')
])


export const compraSchema = z.object({
  id: z.number().optional(),
  proveedor_id: z.string().min(1, 'Proveedor es requerido.'),
  producto_id: z.number().min(1, 'Producto es requerido.'),
  vendedor_id: z.string().min(1, 'Vendedor es requerido.'),
  soporte_mensaje: z.string().nullable().optional(),
  soporte_asunto: z.string().nullable().optional(),
  soporte_respuesta: z.string().nullable().optional(),
  stock_producto_id: z.number().min(1, 'Stock del producto es requerido.'),
  precio: z.number().min(0.1, 'Precio es requerido.'),
  stock_productos: z.object({
    email: z.string().nullable(),
    perfil: z.string().nullable(),
    pin: z.string().nullable(),
    clave: z.string().nullable(),
  }).optional(),
  productos: z.object({
    nombre: z.string().min(1, 'Nombre del producto es requerido.'),
    tiempo_uso: z.number().optional(),
    precio_publico: z.number().min(0.1, 'Precio es requerido.'),
    precio_renovacion: z.number().optional(),
    descripcion: z.string().optional(),
    informacion: z.string().optional(),
    condiciones: z.string().optional(),
    renovable: z.boolean().optional(),
  }).optional(),
  usuarios: z.object({
    nombres: z.string().min(1, 'Nombres es requerido.'),
    apellidos: z.string().min(1, 'Apellidos es requerido.'),
    usuario: z.string().min(1, 'Usuario es requerido.'),
    telefono: z.string().min(1, 'Teléfono es requerido.'),
    billetera_id: z.string().nullable().optional(),
  }).optional(),
  nombre_cliente: z.string().min(1, 'Nombre del cliente es requerido.'),
  telefono_cliente: z.string().min(1, 'Teléfono del cliente es requerido.'),
  fecha_inicio: z.string().nullable(),
  fecha_expiracion: z.string().nullable(),
  monto_reembolso: z.number(),
  estado: compraEstadoSchema,
})




export type CompraEstado = z.infer<typeof compraEstadoSchema>
export type Compra = z.infer<typeof compraSchema>



