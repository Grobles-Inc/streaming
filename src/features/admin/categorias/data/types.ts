export type Categoria = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  created_at: string
  updated_at: string
}

export type Producto = {
  id: string
  categoria_id: string
  nombre: string
  proveedor_id: string
  condiciones: string | null
  precio_publico: number
  stock: number
  imagen_url: string | null
  created_at: string
  updated_at: string
  tiempo_uso: string | null
  descripcion_completa: string | null
  disponibilidad: string | null
  precio_vendedor: number
  precio_renovacion: number
  stock_de_producto: number
  descripcion: string | null
  categoria?: Categoria
  usuarios?: {
    id: string
    nombres: string
    apellidos: string
    telefono: string | null
    rol: string
  }
}

export type CategoriaFormData = {
  nombre: string
  descripcion: string
  imagen_url: string
}
