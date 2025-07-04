import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SupabaseStorageService, supabase } from '@/lib/supabase'
import { IconUpload, IconX } from '@tabler/icons-react'
import type { Categoria } from '../data/types'

interface CategoriaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria | null
  onSubmit: (data: { nombre: string; descripcion: string; imagen_url: string }) => Promise<void>
  isEditing?: boolean
}

export function CategoriaModal({
  open,
  onOpenChange,
  categoria,
  onSubmit,
  isEditing = false
}: CategoriaModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre)
      setDescripcion(categoria.descripcion || '')
      setImagenUrl(categoria.imagen_url || '')
      setPreviewUrl(categoria.imagen_url || '')
      setSelectedFile(null)
    } else {
      setNombre('')
      setDescripcion('')
      setImagenUrl('')
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [categoria, open])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      setSelectedFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setImagenUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      toast.error('El nombre de la categoría es requerido')
      return
    }

    try {
      setIsSubmitting(true)
      let finalImageUrl = imagenUrl

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        setIsUploadingImage(true)
        try {
          // Obtener el usuario actual
          const { data: { user } } = await supabase.auth.getUser()
          const userId = user?.id || 'anonymous'
          
          finalImageUrl = await SupabaseStorageService.uploadCategoryImage(selectedFile, userId)
          setImagenUrl(finalImageUrl)
        } catch (error) {
          console.error('Error subiendo imagen:', error)
          toast.error('Error al subir la imagen. Por favor intenta de nuevo.')
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagen_url: finalImageUrl.trim()
      })
      
      toast.success(isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente')
      
      if (!isEditing) {
        setNombre('')
        setDescripcion('')
        setImagenUrl('')
        setSelectedFile(null)
        setPreviewUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error al guardar categoría:', error)
      toast.error('Error al guardar la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setNombre('')
    setDescripcion('')
    setImagenUrl('')
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos de la categoría' 
              : 'Completa los datos para crear una nueva categoría'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Nombre de la categoría"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción de la categoría"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="imagen">Imagen de la Categoría</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex flex-col items-center space-y-3">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-5 h-5 p-0"
                      onClick={handleRemoveImage}
                      disabled={isSubmitting}
                    >
                      <IconX className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconUpload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  JPG, PNG o WebP (máx. 5MB)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingImage || !nombre.trim()}
            >
              {isUploadingImage 
                ? 'Subiendo imagen...'
                : isSubmitting 
                  ? (isEditing ? 'Actualizando...' : 'Creando...') 
                  : (isEditing ? 'Actualizar' : 'Crear')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
