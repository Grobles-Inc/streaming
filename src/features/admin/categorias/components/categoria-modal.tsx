import { useState, useEffect } from 'react'
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
import { ImagenSelector } from './imagen-selector'
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

  useEffect(() => {
    if (categoria) {
      setNombre(categoria.nombre)
      setDescripcion(categoria.descripcion || '')
      setImagenUrl(categoria.imagen_url || '')
    } else {
      setNombre('')
      setDescripcion('')
      setImagenUrl('')
    }
  }, [categoria, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nombre.trim()) {
      toast.error('El nombre de la categoría es requerido')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagen_url: imagenUrl.trim()
      })
      
      toast.success(isEditing ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente')
      
      if (!isEditing) {
        setNombre('')
        setDescripcion('')
        setImagenUrl('')
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
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-4">
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
              <Label>Imagen de la categoría</Label>
              <div className="min-h-[80px]">
                <ImagenSelector
                  imagenSeleccionada={imagenUrl}
                  onImagenSeleccionada={setImagenUrl}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
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
              disabled={isSubmitting || !nombre.trim()}
            >
              {isSubmitting 
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
