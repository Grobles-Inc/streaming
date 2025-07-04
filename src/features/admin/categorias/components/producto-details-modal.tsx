import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { IconUpload, IconX } from '@tabler/icons-react'
import { SupabaseStorageService, supabase } from '@/lib/supabase'
import { CategoriasService } from '../services'
import { useCategorias, useProveedores } from '../queries'
import type { Producto } from '../data/types'

interface ProductoDetailsModalProps {
  producto: Producto | null
  onClose: () => void
  onUpdate: (producto: Producto) => void
}

export function ProductoDetailsModal({ producto, onClose, onUpdate }: ProductoDetailsModalProps) {
  const [productoDetalles, setProductoDetalles] = useState<Producto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  useEffect(() => {
    if (producto) {
      setProductoDetalles({ ...producto })
      setPreviewUrl(producto.imagen_url || null)
      setSelectedFile(null)
    }
  }, [producto])

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
    if (productoDetalles) {
      setProductoDetalles({ ...productoDetalles, imagen_url: '' })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productoDetalles) return

    try {
      setIsSubmitting(true)
      let finalImageUrl = productoDetalles.imagen_url || ''

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
          alert('Error al subir la imagen. Por favor intenta de nuevo.')
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      const updatedProducto = await CategoriasService.updateProducto(
        productoDetalles.id,
        { ...productoDetalles, imagen_url: finalImageUrl }
      )
      onUpdate(updatedProducto)
      onClose()
    } catch (error) {
      console.error('Error al actualizar producto:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!producto || !productoDetalles) return null

  return (
    <Dialog open={!!producto} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <Card className="max-h-[80vh] overflow-y-auto">
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <Input
                    placeholder="Nombre"
                    value={productoDetalles.nombre}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, nombre: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <Input
                    placeholder="Descripción"
                    value={productoDetalles.descripcion || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, descripcion: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Condiciones</label>
                  <Input
                    placeholder="Condiciones"
                    value={productoDetalles.condiciones || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, condiciones: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precio Público</label>
                  <Input
                    placeholder="Precio Público"
                    type="number"
                    value={productoDetalles.precio_publico}
                    onChange={e =>
                      setProductoDetalles({
                        ...productoDetalles,
                        precio_publico: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precio Vendedor</label>
                  <Input
                    placeholder="Precio Vendedor"
                    type="number"
                    value={productoDetalles.precio_vendedor}
                    onChange={e =>
                      setProductoDetalles({
                        ...productoDetalles,
                        precio_vendedor: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precio Renovar</label>
                  <Input
                    placeholder="Precio Renovar"
                    type="number"
                    value={productoDetalles.precio_renovacion}
                    onChange={e =>
                      setProductoDetalles({
                        ...productoDetalles,
                        precio_renovacion: parseFloat(e.target.value) || 0,
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <Input
                    placeholder="Stock"
                    type="number"
                    value={productoDetalles.stock}
                    onChange={e =>
                      setProductoDetalles({
                        ...productoDetalles,
                        stock: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tiempo de Uso</label>
                  <Input
                    placeholder="Tiempo de Uso"
                    value={productoDetalles.tiempo_uso || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, tiempo_uso: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">Imagen del Producto</label>
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
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productoDetalles.categoria_id || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, categoria_id: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>
                      Selecciona una categoría
                    </option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={productoDetalles.proveedor_id || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, proveedor_id: e.target.value })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="">Sin proveedor</option>
                    {proveedores.map(proveedor => (
                      <option key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombres} {proveedor.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                  {isUploadingImage ? 'Subiendo imagen...' : 
                   isSubmitting ? 'Actualizando...' : 
                   'Actualizar'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
