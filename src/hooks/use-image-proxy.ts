import { useMemo } from 'react';

/**
 * Hook para optimizar URLs de imágenes usando el proxy de Netlify
 * Esto reduce el egreso de Supabase cachando las imágenes en Netlify CDN
 */
export function useImageProxy() {
  const getProxiedImageUrl = useMemo(() => {
    return (supabaseUrl: string | null | undefined): string => {
      // Si no hay URL, retornar una imagen por defecto o string vacío
      if (!supabaseUrl) {
        return '';
      }

      try {
        // Verificar si es una URL de Supabase Storage
        const url = new URL(supabaseUrl);
        const isSupabaseStorage = url.pathname.includes('/storage/v1/object/public/');
        
        if (isSupabaseStorage) {
          // Extraer el path después de /storage/v1/object/public/
          const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
          
          if (pathMatch && pathMatch[1]) {
            const imagePath = pathMatch[1];
            // Retornar la URL del proxy de Netlify
            return `/.netlify/functions/image-proxy/${imagePath}`;
          }
        }
        
        // Si no es de Supabase, retornar la URL original
        return supabaseUrl;
      } catch (error) {
        // Si hay error parseando la URL, retornar la original
        console.warn('Error parseando URL de imagen:', error);
        return supabaseUrl;
      }
    };
  }, []);

  return { getProxiedImageUrl };
}

/**
 * Función standalone para usar fuera de componentes React
 */
export function getProxiedImageUrl(supabaseUrl: string | null | undefined): string {
  if (!supabaseUrl) {
    return '';
  }

  try {
    const url = new URL(supabaseUrl);
    const isSupabaseStorage = url.pathname.includes('/storage/v1/object/public/');
    
    if (isSupabaseStorage) {
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/(.+)/);
      
      if (pathMatch && pathMatch[1]) {
        const imagePath = pathMatch[1];
        return `/.netlify/functions/image-proxy/${imagePath}`;
      }
    }
    
    return supabaseUrl;
  } catch (error) {
    console.warn('Error parseando URL de imagen:', error);
    return supabaseUrl;
  }
}
