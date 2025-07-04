import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SupabaseStorageService, supabase } from '@/lib/supabase'
import { IconUpload, IconX } from '@tabler/icons-react'
import type { Categoria } from '../data/types'

interface CategoriaFormProps {
  categoria?: Categoria | null
  onSubmit: (data: { nombre: string; descripcion: string; imagen_url: string }) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
}

export function CategoriaForm({ categoria, onSubmit, onCancel, isEditing = false }: CategoriaFormProps) {
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
  }, [categoria])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!nombre.trim()) return

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
          alert('Error al subir la imagen. Por favor intenta de nuevo.')
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
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          disabled={isSubmitting}
        />
        <Input
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || isUploadingImage}>
          {isSubmitting ? 'Guardando...' : 
           isUploadingImage ? 'Subiendo imagen...' :
           (isEditing ? 'Actualizar' : 'Agregar')}
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
      </form>

      {/* Selector de imagen */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex flex-col items-center space-y-4">
          {previewUrl ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                onClick={handleRemoveImage}
                disabled={isSubmitting}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <IconUpload className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="mb-2"
            >
              <IconUpload className="mr-2 h-4 w-4" />
              {previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Button>
            <p className="text-xs text-gray-500">
              JPG, PNG o WebP (máx. 5MB)
            </p>
          </div>

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
  )
}
