import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  IconUpload,
  IconX,
  IconLoader2
} from '@tabler/icons-react'
import { uploadImageToSupabase } from '../services/imagen.service'
import { toast } from 'sonner'
interface ImagenSelectorProps {
  imagenSeleccionada: string
  onImagenSeleccionada: (url: string) => void
  disabled?: boolean
}

export function ImagenSelector({ 
  imagenSeleccionada, 
  onImagenSeleccionada, 
  disabled = false 
}: ImagenSelectorProps) {
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB')
        return
      }

      setIsUploading(true)

      try {
        // Crear URL temporal para preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImagenPreview(result)
        }
        reader.readAsDataURL(file)

        // Subir archivo a Supabase Storage
        const imagenUrl = await uploadImageToSupabase(file)
        onImagenSeleccionada(imagenUrl)
        toast.success('Imagen subida correctamente')
      } catch (error) {
        console.error('Error al subir imagen:', error)
        toast.error('Error al subir la imagen. Inténtalo de nuevo.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveImage = () => {
    onImagenSeleccionada('')
    setImagenPreview(null)
  }

  const abrirSelectorArchivo = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {!imagenSeleccionada ? (
        /* Área de subida cuando no hay imagen */
        <div className="space-y-3">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
              isUploading 
                ? 'border-blue-200 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onClick={!isUploading ? abrirSelectorArchivo : undefined}
          >
            {isUploading ? (
              <IconLoader2 className="mx-auto h-10 w-10 mb-2 text-blue-500 animate-spin" />
            ) : (
              <IconUpload className="mx-auto h-10 w-10 mb-2 text-gray-400" />
            )}
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isUploading ? 'Subiendo imagen...' : 'Haz clic para seleccionar una imagen'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, JPEG hasta 5MB
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />

          {imagenPreview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">Vista previa:</p>
              <div className="flex justify-center">
                <div className="relative w-40 h-40 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={imagenPreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Vista de imagen seleccionada */
        <div className="space-y-3">
          <div className="relative">
            <div className="w-full aspect-square max-w-xs mx-auto border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={imagenSeleccionada}
                alt="Imagen de categoría"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent && !parent.querySelector('.error-placeholder')) {
                    const placeholder = document.createElement('div')
                    placeholder.className = 'error-placeholder flex items-center justify-center w-full h-full text-gray-400 text-sm'
                    placeholder.textContent = 'Error al cargar imagen'
                    parent.appendChild(placeholder)
                  }
                }}
              />
              
              {/* Botón X en la esquina superior derecha */}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={disabled}
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <IconX className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Botón de cambiar imagen debajo */}
            <div className="flex justify-center mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={abrirSelectorArchivo}
                disabled={disabled || isUploading}
                className="text-gray-600 hover:text-gray-900"
              >
                <IconUpload className="h-4 w-4 mr-1" />
                Cambiar imagen
              </Button>
            </div>
          </div>
          
          {/* Input file oculto para cambiar imagen */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          
          {/* Indicador de carga cuando se está cambiando la imagen */}
          {isUploading && (
            <div className="flex items-center justify-center py-2">
              <IconLoader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
              <span className="text-sm text-blue-600">Subiendo nueva imagen...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
