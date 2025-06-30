import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <Input
        placeholder="URL de la imagen"
        value={imagenUrl}
        onChange={e => setImagenUrl(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Agregar')}
      </Button>
      {isEditing && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
      )}
    </form>
  )
}
