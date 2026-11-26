/**
 * Compresión de imágenes en el cliente antes de subirlas a Storage.
 *
 * Reduce los bytes almacenados y, por lo tanto, el egreso de Supabase en cada
 * lectura en frío (la CDN solo absorbe las lecturas repetidas).
 *
 * Todo es best-effort: si algo falla se devuelve el archivo original, nunca se
 * bloquea la subida.
 */

/** Lado mayor máximo de la imagen resultante. */
const MAX_DIMENSION = 1600

/** Calidad del encoder WebP (0-1). */
const QUALITY = 0.8

/** Archivos por debajo de este tamaño no se tocan: no hay nada que ganar. */
const MIN_SIZE_TO_PROCESS = 150 * 1024

/** Tipos que no deben re-encodarse (animación o transparencia vectorial). */
const SKIPPED_TYPES = ['image/gif', 'image/svg+xml']

function replaceExtension(name: string, extension: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  return `${base}.${extension}`
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

/**
 * Devuelve un `File` listo para subir: reescalado a `MAX_DIMENSION` y
 * re-encodado a WebP cuando el navegador lo soporta y el resultado es más
 * pequeño que el original.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (SKIPPED_TYPES.includes(file.type)) return file
  if (file.size < MIN_SIZE_TO_PROCESS) return file

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
    const targetWidth = Math.round(width * scale)
    const targetHeight = Math.round(height * scale)

    // Ya tiene un tamaño razonable: re-encodar solo degradaría la calidad.
    if (scale === 1) {
      bitmap.close()
      return file
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()

    const blob = await toBlob(canvas, 'image/webp', QUALITY)

    // Navegadores sin soporte WebP devuelven el blob en otro formato.
    if (!blob || blob.type !== 'image/webp') return file
    if (blob.size >= file.size) return file

    return new File([blob], replaceExtension(file.name, 'webp'), {
      type: 'image/webp',
    })
  } catch (error) {
    console.warn('No se pudo comprimir la imagen, se sube el original:', error)
    return file
  }
}