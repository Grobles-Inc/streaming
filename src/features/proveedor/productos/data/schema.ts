import { z } from 'zod'

// Enum para disponibilidad
export const disponibilidadSchema = z.union([
  z.literal('en_stock'),
  z.literal('a_pedido'),
  z.literal('activacion'),
])
export type Disponibilidad = z.infer<typeof disponibilidadSchema>

// Schema para el formulario de productos (sin campos auto-generados)
export const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  precio_publico: z.coerce.number().min(0, "El precio público debe ser mayor o igual a 0"),
  precio_vendedor: z.coerce.number().min(0, "El precio vendedor debe ser mayor o igual a 0"),
  precio_renovacion: z.coerce.number().min(0, "El precio renovación debe ser mayor o igual a 0").optional(),
  stock: z.coerce.number().int().min(0, "El stock debe ser un número entero mayor o igual a 0"),
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
  url_cuenta: z.string().optional(),
  destacado: z.boolean(),
  mas_vendido: z.boolean(),
  descripcion_completa: z.string().optional(),
  solicitud: z.string().optional(),
  muestra_disponibilidad_stock: z.boolean(),
  deshabilitar_boton_comprar: z.boolean(),
})

// Schema completo que incluye todos los campos de la BD (para uso interno)
export const productoCompleteSchema = productoSchema.extend({
  id: z.string(),
  proveedor_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
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