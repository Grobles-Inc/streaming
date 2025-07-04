import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImagenSelector } from './imagen-selector'
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
  }, [categoria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagen_url: imagenUrl.trim()
      })
      
      if (!isEditing) {
        setNombre('')
        setDescripcion('')
        setImagenUrl('')
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la categoría</Label>
            <Input
              id="nombre"
              placeholder="Ej: Streaming, Gaming, Software..."
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              placeholder="Descripción breve de la categoría"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagen de la categoría</Label>
          <ImagenSelector
            imagenSeleccionada={imagenUrl}
            onImagenSeleccionada={setImagenUrl}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting || !nombre.trim()}>
            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
