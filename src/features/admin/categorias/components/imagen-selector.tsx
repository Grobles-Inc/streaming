import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { 
  IconPhoto,
  IconUpload,
  IconX,
  IconEye,
  IconCheck
} from '@tabler/icons-react'
import { 
  IMAGENES_CATEGORIAS_PREDEFINIDAS,
  uploadImageToSupabase,
  validateImageUrl
} from '../services/imagen.service'
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
  const [isOpen, setIsOpen] = useState(false)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [tipoSeleccion, setTipoSeleccion] = useState<'predefinida' | 'archivo' | 'url'>('predefinida')
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isValidatingUrl, setIsValidatingUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
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
        setIsOpen(false)
      } catch (error) {
        console.error('Error al subir imagen:', error)
        alert('Error al subir la imagen. Inténtalo de nuevo.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleImagenPredefinida = (url: string) => {
    onImagenSeleccionada(url)
    setIsOpen(false)
  }

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      setIsValidatingUrl(true)
      try {
        const isValid = await validateImageUrl(urlInput.trim())
        if (isValid) {
          onImagenSeleccionada(urlInput.trim())
          setUrlInput('')
          setIsOpen(false)
        } else {
          alert('La URL no contiene una imagen válida o no es accesible')
        }
      } catch (error) {
        alert('Error al validar la URL de la imagen')
      } finally {
        setIsValidatingUrl(false)
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              disabled={disabled}
            >
              <IconPhoto className="mr-2 h-4 w-4" />
              {imagenSeleccionada ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Seleccionar imagen de categoría</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Selector de tipo */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={tipoSeleccion === 'predefinida' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoSeleccion('predefinida')}
                  className="flex-1"
                >
                  <IconPhoto className="mr-2 h-4 w-4" />
                  Predefinidas
                </Button>
                <Button
                  type="button"
                  variant={tipoSeleccion === 'archivo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoSeleccion('archivo')}
                  className="flex-1"
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  Subir archivo
                </Button>
                <Button
                  type="button"
                  variant={tipoSeleccion === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTipoSeleccion('url')}
                  className="flex-1"
                >
                  <IconPhoto className="mr-2 h-4 w-4" />
                  URL
                </Button>
              </div>

              {/* Contenido según tipo de selección */}
              {tipoSeleccion === 'predefinida' ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Selecciona una imagen predefinida para la categoría:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {IMAGENES_CATEGORIAS_PREDEFINIDAS.map((imagen) => (
                      <div
                        key={imagen.id}
                        className={`relative cursor-pointer rounded-lg border-2 p-2 transition-colors hover:bg-muted ${
                          imagenSeleccionada === imagen.url
                            ? 'border-primary bg-primary/5'
                            : 'border-border'
                        }`}
                        onClick={() => handleImagenPredefinida(imagen.url)}
                      >
                        <div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
                          <img
                            src={imagen.url}
                            alt={imagen.nombre}
                            className="w-full h-full object-cover rounded-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const fallback = document.createElement('div')
                                fallback.className = 'fallback-icon flex items-center justify-center w-full h-full text-muted-foreground text-xs'
                                fallback.textContent = imagen.nombre
                                parent.appendChild(fallback)
                              }
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-xs truncate">{imagen.nombre}</div>
                        </div>
                        {imagenSeleccionada === imagen.url && (
                          <div className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground p-1">
                            <IconCheck className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : tipoSeleccion === 'archivo' ? (
                <div className="space-y-3">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isUploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={!isUploading ? abrirSelectorArchivo : undefined}
                  >
                    <IconUpload className={`mx-auto h-8 w-8 mb-2 ${isUploading ? 'text-gray-300' : 'text-gray-400'}`} />
                    <p className="text-sm text-gray-600">
                      {isUploading ? 'Subiendo imagen...' : 'Haz clic para seleccionar una imagen'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
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
                      <p className="text-sm font-medium">Vista previa:</p>
                      <div className="relative">
                        <img
                          src={imagenPreview}
                          alt="Vista previa"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL de la imagen:</label>
                    <Input
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      disabled={isValidatingUrl}
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || isValidatingUrl}
                    className="w-full"
                  >
                    {isValidatingUrl ? 'Validando...' : 'Usar esta URL'}
                  </Button>

                  {urlInput && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Vista previa:</p>
                      <img
                        src={urlInput}
                        alt="Vista previa"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {imagenSeleccionada && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <IconX className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Vista previa actual */}
      {imagenSeleccionada && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconEye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Imagen actual:</span>
          </div>
          <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden border">
            <img
              src={imagenSeleccionada}
              alt="Imagen de categoría"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                // Mostrar placeholder en caso de error
                const parent = target.parentElement
                if (parent && !parent.querySelector('.error-placeholder')) {
                  const placeholder = document.createElement('div')
                  placeholder.className = 'error-placeholder flex items-center justify-center w-full h-full text-gray-400 text-xs'
                  placeholder.textContent = 'Error al cargar imagen'
                  parent.appendChild(placeholder)
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {imagenSeleccionada}
          </p>
        </div>
      )}
    </div>
  )
}
