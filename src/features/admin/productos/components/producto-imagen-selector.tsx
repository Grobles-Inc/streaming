import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { 
  IconUpload,
  IconX,
  IconEye,
  IconCheck,
  IconLoader2
} from '@tabler/icons-react'
import { SupabaseStorageService } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

interface ProductoImagenSelectorProps {
  imagenSeleccionada: string
  onImagenSeleccionada: (url: string) => void
  disabled?: boolean
}

export function ProductoImagenSelector({ 
  imagenSeleccionada, 
  onImagenSeleccionada, 
  disabled = false 
}: ProductoImagenSelectorProps) {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [tipoSeleccion, setTipoSeleccion] = useState<'archivo' | 'url'>('archivo')
  const [urlInput, setUrlInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isValidatingUrl, setIsValidatingUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

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
      const imagenUrl = await SupabaseStorageService.uploadProductImage(file, user.id)
      onImagenSeleccionada(imagenUrl)
      toast.success('Imagen subida correctamente')
      setIsOpen(false)
    } catch (error) {
      console.error('Error al subir imagen:', error)
      toast.error('Error al subir la imagen. Inténtalo de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const contentType = response.headers.get('content-type')
      return response.ok && Boolean(contentType?.startsWith('image/'))
    } catch {
      return false
    }
  }

  const handleUrlSubmit = async () => {
    if (urlInput.trim()) {
      setIsValidatingUrl(true)
      try {
        const isValid = await validateImageUrl(urlInput.trim())
        if (isValid) {
          onImagenSeleccionada(urlInput.trim())
          setUrlInput('')
          toast.success('URL de imagen aplicada correctamente')
          setIsOpen(false)
        } else {
          toast.error('La URL no contiene una imagen válida o no es accesible')
        }
      } catch (error) {
        toast.error('Error al validar la URL de la imagen')
      } finally {
        setIsValidatingUrl(false)
      }
    }
  }

  const abrirSelectorArchivo = () => {
    fileInputRef.current?.click()
  }

  const limpiarSeleccion = () => {
    onImagenSeleccionada('')
    setImagenPreview(null)
    setUrlInput('')
  }

  // Si no hay imagen seleccionada, mostrar área de subida directamente
  if (!imagenSeleccionada) {
    return (
      <div className="space-y-3">
        <Label>Imagen del producto</Label>
        <div 
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors group ${
            isUploading || disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onClick={!isUploading && !disabled ? abrirSelectorArchivo : undefined}
        >
          {isUploading ? (
            <>
              <IconLoader2 className="mx-auto h-12 w-12 mb-3 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Subiendo imagen...</p>
              <p className="text-xs text-gray-400 mt-1">Por favor espera</p>
            </>
          ) : (
            <>
              <IconUpload className="mx-auto h-12 w-12 mb-3 text-gray-400 group-hover:text-gray-500 transition-colors" />
              <p className="text-sm text-gray-600 font-medium">
                Haz clic para seleccionar una imagen
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, JPEG hasta 5MB
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading || disabled}
          className="hidden"
        />

        {/* Botón para opciones avanzadas (URL) */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={disabled || isUploading}
            >
              <IconEye className="mr-2 h-4 w-4" />
              Usar URL externa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconEye className="h-5 w-5" />
                URL externa
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">URL de la imagen</Label>
                <div className="flex gap-2">
                  <Input
                    id="url-input"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isValidatingUrl}
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || isValidatingUrl}
                  >
                    {isValidatingUrl ? (
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {urlInput && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Vista previa:</p>
                  <div className="relative">
                    <img
                      src={urlInput}
                      alt="Vista previa URL"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          const fallback = document.createElement('div')
                          fallback.className = 'w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400'
                          fallback.innerHTML = '<span class="text-sm">No se pudo cargar la imagen</span>'
                          parent.appendChild(fallback)
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Si hay imagen seleccionada, mostrar imagen con overlay de acciones
  return (
    <div className="space-y-3">
      <Label>Imagen del producto</Label>
      <div className="relative group">
        <img
          src={imagenSeleccionada}
          alt="Imagen del producto"
          className="w-full h-48 object-cover rounded-lg border"
          onError={() => {
            console.error('Error al cargar imagen:', imagenSeleccionada)
            onImagenSeleccionada('')
          }}
        />
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={disabled}
                className="bg-white/90 text-gray-900 hover:bg-white"
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Cambiar
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconUpload className="h-5 w-5" />
                  Cambiar imagen del producto
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Pestañas de selección */}
                <div className="flex border-b">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      tipoSeleccion === 'archivo'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setTipoSeleccion('archivo')}
                  >
                    <IconUpload className="inline mr-2 h-4 w-4" />
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      tipoSeleccion === 'url'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setTipoSeleccion('url')}
                  >
                    <IconEye className="inline mr-2 h-4 w-4" />
                    URL externa
                  </button>
                </div>

                {/* Contenido según tipo de selección */}
                <div className="min-h-[200px]">
                  {tipoSeleccion === 'archivo' ? (
                    <div className="space-y-3">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isUploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={!isUploading ? abrirSelectorArchivo : undefined}
                      >
                        {isUploading ? (
                          <IconLoader2 className="mx-auto h-8 w-8 mb-2 text-gray-400 animate-spin" />
                        ) : (
                          <IconUpload className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                        )}
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
                        <Label htmlFor="url-input">URL de la imagen</Label>
                        <div className="flex gap-2">
                          <Input
                            id="url-input"
                            type="url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isValidatingUrl}
                          />
                          <Button
                            type="button"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim() || isValidatingUrl}
                          >
                            {isValidatingUrl ? (
                              <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <IconCheck className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {urlInput && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Vista previa:</p>
                          <div className="relative">
                            <img
                              src={urlInput}
                              alt="Vista previa URL"
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400'
                                  fallback.innerHTML = '<span class="text-sm">No se pudo cargar la imagen</span>'
                                  parent.appendChild(fallback)
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={limpiarSeleccion}
            disabled={disabled}
            className="bg-red-500/90 hover:bg-red-500"
          >
            <IconX className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
