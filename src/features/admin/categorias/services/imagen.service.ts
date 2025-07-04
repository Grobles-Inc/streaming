// Servicio para manejo de imágenes en Supabase Storage

// Configuración de Supabase Storage
export const SUPABASE_STORAGE_CONFIG = {
  baseUrl: 'https://hlscpuwrukraibyejkiy.supabase.co/storage/v1/object/public/productos-images',
  bucket: 'productos-images',
  categoriasPath: 'categorias'
}

// Imágenes predefinidas disponibles en Supabase Storage
export const IMAGENES_CATEGORIAS_PREDEFINIDAS = [
  {
    id: 'streaming',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/streaming.png`,
    nombre: 'Streaming',
    descripcion: 'Servicios de video y música'
  },
  {
    id: 'gaming',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/gaming.png`,
    nombre: 'Gaming',
    descripcion: 'Juegos y plataformas gaming'
  },
  {
    id: 'software',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/software.png`,
    nombre: 'Software',
    descripcion: 'Aplicaciones y herramientas'
  },
  {
    id: 'educacion',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/educacion.png`,
    nombre: 'Educación',
    descripcion: 'Cursos y plataformas educativas'
  },
  {
    id: 'vpn',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/vpn.png`,
    nombre: 'VPN',
    descripcion: 'Servicios de VPN y seguridad'
  },
  {
    id: 'redes-sociales',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/redes-sociales.png`,
    nombre: 'Redes Sociales',
    descripcion: 'Plataformas sociales premium'
  },
  {
    id: 'antivirus',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/antivirus.png`,
    nombre: 'Antivirus',
    descripcion: 'Software de seguridad'
  },
  {
    id: 'almacenamiento',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/almacenamiento.png`,
    nombre: 'Almacenamiento',
    descripcion: 'Servicios de almacenamiento en la nube'
  },
  {
    id: 'productividad',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/productividad.png`,
    nombre: 'Productividad',
    descripcion: 'Herramientas de trabajo y oficina'
  },
  {
    id: 'otros',
    url: `${SUPABASE_STORAGE_CONFIG.baseUrl}/categorias/otros.png`,
    nombre: 'Otros',
    descripcion: 'Otros servicios y productos'
  }
]

/**
 * Genera un nombre único para el archivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
}

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Verificar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'El archivo debe ser una imagen' }
  }

  // Verificar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'La imagen debe ser menor a 5MB' }
  }

  // Verificar extensiones permitidas
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Solo se permiten archivos JPG, PNG y WebP' }
  }

  return { isValid: true }
}

/**
 * Sube una imagen a Supabase Storage
 */
export async function uploadImageToSupabase(file: File): Promise<string> {
  // Validar archivo
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Obtener el usuario actual para organizar por usuario
  // En este contexto no podemos usar hooks, así que usaremos un userId genérico por ahora
  // En producción se debería pasar el userId como parámetro
  const userId = 'categoria-admin'
  
  try {
    const { SupabaseStorageService } = await import('@/lib/supabase')
    return await SupabaseStorageService.uploadCategoryImage(file, userId)
  } catch (error) {
    console.error('Error al subir imagen:', error)
    throw new Error('Error al subir la imagen. Inténtalo de nuevo.')
  }
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  try {
    const { SupabaseStorageService } = await import('@/lib/supabase')
    await SupabaseStorageService.deleteCategoryImage(imageUrl)
  } catch (error) {
    console.error('Error al eliminar imagen:', error)
    // No lanzamos error para no bloquear operaciones si la eliminación falla
  }
}

/**
 * Verifica si una URL de imagen es válida
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && Boolean(contentType?.startsWith('image/'))
  } catch {
    return false
  }
}
