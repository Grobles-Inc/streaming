import { createClient } from '@supabase/supabase-js'
import { getProxiedImageUrl } from '@/hooks/use-image-proxy'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Servicio para subir archivos a Supabase Storage
export class SupabaseStorageService {
  /**
   * Obtiene la URL optimizada de una imagen (con proxy de Netlify para reducir egreso de Supabase)
   */
  static getOptimizedImageUrl(imageUrl: string): string {
    return getProxiedImageUrl(imageUrl)
  }

  /**
   * Sube una imagen al bucket de productos y retorna la URL optimizada
   */
  static async uploadProductImage(file: File, userId: string): Promise<string> {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `productos/${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('productos-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error subiendo imagen:', error)
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('productos-images')
      .getPublicUrl(data.path)

    return publicUrl
  }

  /**
   * Elimina una imagen del storage
   */
  static async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const url = new URL(imageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/productos-images\/(.+)/)
      
      if (!pathMatch) {
        throw new Error('URL de imagen inválida')
      }

      const filePath = pathMatch[1]

      const { error } = await supabase.storage
        .from('productos-images')
        .remove([filePath])

      if (error) {
        console.error('Error eliminando imagen:', error)
        throw new Error(`Error al eliminar imagen: ${error.message}`)
      }
    } catch (error) {
      console.error('Error procesando eliminación de imagen:', error)
      // No lanzamos error para no bloquear operaciones si la eliminación falla
    }
  }

  /**
   * Sube una imagen al bucket de categorías
   */
  static async uploadCategoryImage(file: File, userId: string): Promise<string> {
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `categorias/${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('productos-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error subiendo imagen:', error)
      throw new Error(`Error al subir imagen: ${error.message}`)
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('productos-images')
      .getPublicUrl(data.path)

    return publicUrl
  }

  /**
   * Elimina una imagen de categoría del storage
   */
  static async deleteCategoryImage(imageUrl: string): Promise<void> {
    try {
      // Extraer el path de la URL
      const url = new URL(imageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/productos-images\/(.+)/)
      
      if (!pathMatch) {
        throw new Error('URL de imagen inválida')
      }

      const filePath = pathMatch[1]

      const { error } = await supabase.storage
        .from('productos-images')
        .remove([filePath])

      if (error) {
        console.error('Error eliminando imagen:', error)
        throw new Error(`Error al eliminar imagen: ${error.message}`)
      }
    } catch (error) {
      console.error('Error procesando eliminación de imagen:', error)
      // No lanzamos error para no bloquear operaciones si la eliminación falla
    }
  }
}