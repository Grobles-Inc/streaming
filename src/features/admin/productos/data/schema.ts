import { z } from 'zod'

// Esquema para estado de producto
const estadoProductoSchema = z.union([
  z.literal('borrador'),
  z.literal('publicado'),
])

// Esquema para disponibilidad de producto
const disponibilidadProductoSchema = z.union([
  z.literal('en_stock'),
  z.literal('a_pedido'),
  z.literal('activacion'),
])

// Esquema para producto base
const productoBaseSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().nullable(),
  informacion: z.string().nullable(),
  condiciones: z.string().nullable(),
  precio_publico: z.number().min(0, 'El precio público debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  categoria_id: z.string().min(1, 'La categoría es requerida'),
  proveedor_id: z.string().min(1, 'El proveedor es requerido'),
  imagen_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  tiempo_uso: z.number().min(0, 'El tiempo de uso debe ser mayor o igual a 0'),
  a_pedido: z.boolean(),
  nuevo: z.boolean(),
  descripcion_completa: z.string().nullable(),
  disponibilidad: disponibilidadProductoSchema,
  renovable: z.boolean(),
  solicitud: z.string().nullable(),
  muestra_disponibilidad_stock: z.boolean(),
  deshabilitar_boton_comprar: z.boolean(),
  precio_vendedor: z.number().min(0, 'El precio de vendedor debe ser mayor a 0'),
  precio_renovacion: z.number().min(0, 'El precio de renovación debe ser mayor a 0').nullable(),
  estado: estadoProductoSchema,
})

// Esquema para producto con relaciones
const productoWithRelationsSchema = productoBaseSchema.extend({
  categorias: z.object({
    id: z.string(),
    nombre: z.string(),
    descripcion: z.string().nullable(),
  }).nullable().optional(),
  usuarios: z.object({
    id: z.string(),
    nombres: z.string(),
    apellidos: z.string(),
    email: z.string(),
  }).nullable().optional(),
})

// Esquema para producto mapeado
const mappedProductoSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  informacion: z.string().nullable(),
  condiciones: z.string().nullable(),
  precioPublico: z.number(),
  precioPublicoFormateado: z.string(),
  precioVendedor: z.number(),
  precioVendedorFormateado: z.string(),
  precioRenovacion: z.number().nullable(),
  precioRenovacionFormateado: z.string().nullable(),
  stock: z.number(),
  categoriaId: z.string(),
  categoriaNombre: z.string(),
  proveedorId: z.string(),
  proveedorNombre: z.string(),
  imagenUrl: z.string().nullable(),
  fechaCreacion: z.date(),
  fechaActualizacion: z.date(),
  tiempoUso: z.number(),
  aPedido: z.boolean(),
  nuevo: z.boolean(),
  descripcionCompleta: z.string().nullable(),
  disponibilidad: disponibilidadProductoSchema,
  renovable: z.boolean(),
  solicitud: z.string().nullable(),
  muestraDisponibilidadStock: z.boolean(),
  deshabilitarBotonComprar: z.boolean(),
  estado: estadoProductoSchema,
  stockDisponible: z.number(),
  stockVendido: z.number(),
  puedeEditar: z.boolean(),
  puedeEliminar: z.boolean(),
  tiempoUsoFormateado: z.string(),
  etiquetas: z.array(z.string()),
})

// Esquema para filtros
const filtroProductoSchema = z.object({
  estado: estadoProductoSchema.optional(),
  categoria_id: z.string().optional(),
  proveedor_id: z.string().optional(),
  disponibilidad: disponibilidadProductoSchema.optional(),
  nuevo: z.boolean().optional(),
  busqueda: z.string().optional(),
})

// Tipos exportados
export type ProductoBase = z.infer<typeof productoBaseSchema>
export type ProductoWithRelations = z.infer<typeof productoWithRelationsSchema>
export type MappedProducto = z.infer<typeof mappedProductoSchema>
export type FiltroProducto = z.infer<typeof filtroProductoSchema>

// Función para mapear producto de Supabase a componente
export function mapSupabaseProductoToComponent(producto: ProductoWithRelations): MappedProducto {
  const categoriaNombre = producto.categorias?.nombre || 'Sin categoría'
  const proveedorNombre = producto.usuarios 
    ? `${producto.usuarios.nombres} ${producto.usuarios.apellidos}`.trim()
    : 'Sin proveedor'

  const precioPublicoFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(producto.precio_publico)

  const precioVendedorFormateado = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(producto.precio_vendedor)

  const precioRenovacionFormateado = producto.precio_renovacion ? new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(producto.precio_renovacion) : null

  const fechaCreacion = new Date(producto.created_at)
  const fechaActualizacion = new Date(producto.updated_at)

  // Para simplificar, usamos el stock del producto directamente
  const stockDisponible = producto.stock
  const stockVendido = 0 // Por ahora, no tenemos esta información

  // Formatear tiempo de uso
  const tiempoUsoFormateado = producto.tiempo_uso > 0 
    ? `${producto.tiempo_uso} día(s)`
    : 'Indefinido'

  // Generar etiquetas
  const etiquetas: string[] = []
  if (producto.nuevo) etiquetas.push('Nuevo')
  if (producto.renovable) etiquetas.push('Renovable')
  if (producto.a_pedido) etiquetas.push('A Pedido')

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    informacion: producto.informacion,
    condiciones: producto.condiciones,
    precioPublico: producto.precio_publico,
    precioPublicoFormateado,
    precioVendedor: producto.precio_vendedor,
    precioVendedorFormateado,
    precioRenovacion: producto.precio_renovacion,
    precioRenovacionFormateado,
    stock: producto.stock,
    categoriaId: producto.categoria_id,
    categoriaNombre,
    proveedorId: producto.proveedor_id,
    proveedorNombre,
    imagenUrl: producto.imagen_url,
    fechaCreacion,
    fechaActualizacion,
    tiempoUso: producto.tiempo_uso,
    aPedido: producto.a_pedido,
    nuevo: producto.nuevo,
    descripcionCompleta: producto.descripcion_completa,
    disponibilidad: producto.disponibilidad,
    renovable: producto.renovable,
    solicitud: producto.solicitud,
    muestraDisponibilidadStock: producto.muestra_disponibilidad_stock,
    deshabilitarBotonComprar: producto.deshabilitar_boton_comprar,
    estado: producto.estado,
    stockDisponible,
    stockVendido,
    puedeEditar: true, // Los admins pueden editar todos los productos
    puedeEliminar: stockVendido === 0, // Solo se puede eliminar si no tiene ventas
    tiempoUsoFormateado,
    etiquetas,
  }
}

// Esquemas para operaciones CRUD
const createProductoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().nullable().optional(),
  informacion: z.string().nullable().optional(),
  condiciones: z.string().nullable().optional(),
  precio_publico: z.number().min(0, 'El precio público debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0').optional(),
  categoria_id: z.string().min(1, 'La categoría es requerida'),
  proveedor_id: z.string().min(1, 'El proveedor es requerido'),
  imagen_url: z.string().nullable().optional(),
  tiempo_uso: z.number().min(0, 'El tiempo de uso debe ser mayor o igual a 0').optional(),
  a_pedido: z.boolean().optional(),
  nuevo: z.boolean().optional(),
  descripcion_completa: z.string().nullable().optional(),
  disponibilidad: disponibilidadProductoSchema,
  renovable: z.boolean().optional(),
  solicitud: z.string().nullable().optional(),
  muestra_disponibilidad_stock: z.boolean().optional(),
  deshabilitar_boton_comprar: z.boolean().optional(),
  precio_vendedor: z.number().min(0, 'El precio de vendedor debe ser mayor a 0'),
  precio_renovacion: z.number().min(0, 'El precio de renovación debe ser mayor a 0').nullable().optional(),
  estado: estadoProductoSchema.optional(),
})

const updateProductoSchema = createProductoSchema.partial().extend({
  id: z.string().min(1, 'El ID es requerido')
})

export type CreateProductoData = z.infer<typeof createProductoSchema>
export type UpdateProductoData = z.infer<typeof updateProductoSchema>

// Validadores
export { estadoProductoSchema, disponibilidadProductoSchema, filtroProductoSchema, createProductoSchema, updateProductoSchema }
