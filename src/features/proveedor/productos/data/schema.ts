import { z } from 'zod'

// Enum para disponibilidad
export const disponibilidadSchema = z.union([
  z.literal('en_stock'),
  z.literal('a_pedido'),
  z.literal('activacion'),
])
export type Disponibilidad = z.infer<typeof disponibilidadSchema>

// Enum para estado del producto
export const estadoProductoSchema = z.union([
  z.literal('borrador'),
  z.literal('publicado'),
  z.literal('pendiente'),
])
export type EstadoProducto = z.infer<typeof estadoProductoSchema>

// Schema para el formulario de productos (sin campos auto-generados)
export const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  precio_publico: z.coerce.number().min(0, "El precio público debe ser mayor o igual a 0"),
  precio_vendedor: z.coerce.number().min(0, "El precio vendedor debe ser mayor o igual a 0"),
  precio_renovacion: z.coerce.number().min(0, "El precio renovación debe ser mayor o igual a 0").optional(),
  categoria_id: z.string().min(1, "La categoría es requerida"),
  tiempo_uso: z.coerce.number().int().min(0, "El tiempo de uso debe ser un número entero mayor o igual a 0"),
  a_pedido: z.boolean(),
  nuevo: z.boolean(),
  disponibilidad: disponibilidadSchema,
  renovable: z.boolean(),
  descripcion: z.string().optional(),
  informacion: z.string().optional(),
  condiciones: z.string().optional(),
  imagen_url: z.string().optional(),
  descripcion_completa: z.string().optional(),
  solicitud: z.string().optional(),
  muestra_disponibilidad_stock: z.boolean(),
  deshabilitar_boton_comprar: z.boolean(),
  fecha_expiracion: z.string().optional(),
})

// Schema completo que incluye todos los campos de la BD (para uso interno)
export const productoCompleteSchema = z.object({
  id: z.number(),
  proveedor_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
  precio_publico: z.coerce.number().min(0, "El precio público debe ser mayor o igual a 0"),
  precio_vendedor: z.coerce.number().min(0, "El precio vendedor debe ser mayor o igual a 0"),
  precio_renovacion: z.coerce.number().min(0, "El precio renovación debe ser mayor o igual a 0").optional().nullable(),
  categoria_id: z.string().min(1, "La categoría es requerida"),
  tiempo_uso: z.coerce.number().int().min(0, "El tiempo de uso debe ser un número entero mayor o igual a 0"),
  a_pedido: z.boolean().nullable().transform(val => val ?? false),
  nuevo: z.boolean().nullable().transform(val => val ?? false),
  disponibilidad: disponibilidadSchema,
  renovable: z.boolean().nullable().transform(val => val ?? false),
  descripcion: z.string().nullable().transform(val => val ?? '').optional(),
  informacion: z.string().nullable().transform(val => val ?? '').optional(),
  condiciones: z.string().nullable().transform(val => val ?? '').optional(),
  imagen_url: z.string().optional(),
  descripcion_completa: z.string().nullable().transform(val => val ?? '').optional(),
  solicitud: z.string().nullable().transform(val => val ?? '').optional(),
  muestra_disponibilidad_stock: z.boolean().nullable().transform(val => val ?? false),
  deshabilitar_boton_comprar: z.boolean().nullable().transform(val => val ?? false),
  estado: estadoProductoSchema,
  fecha_expiracion: z.string().nullable().optional(),
  stock_de_productos: z.any().optional(),
  categorias: z.object({
    nombre: z.string(),
    descripcion: z.string().optional(),
  }).optional(),
  usuarios: z.object({
    nombre: z.string(),
    apellido: z.string(),
  }).optional(),
})

export type Producto = z.infer<typeof productoCompleteSchema>
export type ProductoFormData = z.infer<typeof productoSchema>

export const productosListSchema = z.array(productoCompleteSchema) 