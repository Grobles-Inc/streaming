import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
  const { categorias } = useCategorias()
  const { proveedores } = useProveedores()

  useEffect(() => {
    if (producto) {
      setProductoDetalles({ ...producto })
    }
  }, [producto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productoDetalles) return

    try {
      setIsSubmitting(true)
      const updatedProducto = await CategoriasService.updateProducto(
        productoDetalles.id, 
        productoDetalles
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
                  <label className="block text-sm font-medium mb-1">Precio Renovación</label>
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
                  <label className="block text-sm font-medium mb-1">URL Imagen</label>
                  <Input
                    placeholder="URL Imagen"
                    value={productoDetalles.imagen_url || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, imagen_url: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
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

                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium mb-1">URL Cuenta</label>
                  <Input
                    placeholder="URL Cuenta"
                    value={productoDetalles.url_cuenta || ''}
                    onChange={e =>
                      setProductoDetalles({ ...productoDetalles, url_cuenta: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Actualizando...' : 'Actualizar'}
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
