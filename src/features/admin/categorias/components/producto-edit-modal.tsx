import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { IconLoader2, IconUpload, IconX } from '@tabler/icons-react'
import { SupabaseStorageService, supabase } from '@/lib/supabase'
import { CategoriasService } from '../services'
import { useCategorias, useProveedores } from '../queries'
import type { Producto } from '../data/types'

interface ProductoEditModalProps {
  producto: Producto | null
  open: boolean
  onClose: () => void
  onUpdate: (producto: Producto) => void
}

export function ProductoEditModal({ producto, open, onClose, onUpdate }: ProductoEditModalProps) {
  const [formData, setFormData] = useState<Partial<Producto>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  useEffect(() => {
    if (producto && open) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        condiciones: producto.condiciones || '',
        precio_publico: producto.precio_publico,
        precio_vendedor: producto.precio_vendedor,
        stock: producto.stock,
        categoria_id: producto.categoria_id,
        proveedor_id: producto.proveedor_id,
        imagen_url: producto.imagen_url || '',
      })
      setPreviewUrl(producto.imagen_url || null)
      setSelectedFile(null)
      setErrors({})
    }
  }, [producto, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.precio_publico || formData.precio_publico <= 0) {
      newErrors.precio_publico = 'El precio público debe ser mayor a 0'
    }

    if (!formData.precio_vendedor || formData.precio_vendedor <= 0) {
      newErrors.precio_vendedor = 'El precio de vendedor debe ser mayor a 0'
    }

    if (formData.stock === undefined || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser mayor o igual a 0'
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'La categoría es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, imagen: 'Por favor selecciona un archivo de imagen válido' })
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, imagen: 'La imagen debe ser menor a 5MB' })
        return
      }

      setSelectedFile(file)
      setErrors({ ...errors, imagen: '' })
      
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
    setFormData({ ...formData, imagen_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!producto || !validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      let finalImageUrl = formData.imagen_url || ''

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        setIsUploadingImage(true)
        try {
          // Obtener el usuario actual
          const { data: { user } } = await supabase.auth.getUser()
          const userId = user?.id || 'anonymous'
          
          finalImageUrl = await SupabaseStorageService.uploadProductImage(selectedFile, userId)
        } catch (error) {
          console.error('Error subiendo imagen:', error)
          setErrors({ ...errors, imagen: 'Error al subir la imagen. Por favor intenta de nuevo.' })
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      const updatedProducto = await CategoriasService.updateProducto(
        producto.id,
        { ...formData, imagen_url: finalImageUrl } as Producto
      )
      onUpdate(updatedProducto)
      onClose()
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      setErrors({ general: 'Error al actualizar el producto. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setFormData({})
      setErrors({})
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Producto
            {producto && (
              <Badge variant="outline" className="ml-2">
                ID: {producto.id.slice(0, 8)}...
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Nombre del producto"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={isSubmitting}
                  className={errors.nombre ? 'border-red-500' : ''}
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.categoria_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria_id && (
                  <p className="text-sm text-red-600">{errors.categoria_id}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del producto"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condiciones">Condiciones</Label>
              <Textarea
                id="condiciones"
                placeholder="Condiciones del producto"
                value={formData.condiciones || ''}
                onChange={(e) => setFormData({ ...formData, condiciones: e.target.value })}
                disabled={isSubmitting}
                rows={2}
              />
            </div>
          </div>

          {/* Precios y stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Precios y Stock</h3>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_publico">Precio Público *</Label>
                <Input
                  id="precio_publico"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precio_publico || ''}
                  onChange={(e) => setFormData({ ...formData, precio_publico: parseFloat(e.target.value) || 0 })}
                  disabled={isSubmitting}
                  className={errors.precio_publico ? 'border-red-500' : ''}
                />
                {errors.precio_publico && (
                  <p className="text-sm text-red-600">{errors.precio_publico}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio_vendedor">Precio Vendedor *</Label>
                <Input
                  id="precio_vendedor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.precio_vendedor || ''}
                  onChange={(e) => setFormData({ ...formData, precio_vendedor: parseFloat(e.target.value) || 0 })}
                  disabled={isSubmitting}
                  className={errors.precio_vendedor ? 'border-red-500' : ''}
                />
                {errors.precio_vendedor && (
                  <p className="text-sm text-red-600">{errors.precio_vendedor}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock || ''}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  disabled={isSubmitting}
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Proveedor y configuración */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuración</h3>
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select
                  value={formData.proveedor_id || ''}
                  onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin proveedor</SelectItem>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombres} {proveedor.apellidos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">Imagen del Producto</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center space-y-3">
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
                  
                  <Button
                    type="button"
                    variant="outline"
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
              {errors.imagen && (
                <p className="text-sm text-red-600">{errors.imagen}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <IconX className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
