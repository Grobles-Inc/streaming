import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconEye, IconTrash, IconMenu2 } from '@tabler/icons-react'
import { CategoriasService } from '../services'
import { ProductoDetailsModal } from './producto-details-modal'
import type { Categoria, Producto } from '../data/types'

interface ProductosPorCategoriaProps {
  categoria: Categoria
  productos: Producto[]
  onProductoUpdate: (producto: Producto) => void
  onProductoDelete: (id: string) => void
}

export function ProductosPorCategoria({ 
  categoria, 
  productos, 
  onProductoUpdate,
  onProductoDelete 
}: ProductosPorCategoriaProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [productoDetalles, setProductoDetalles] = useState<Producto | null>(null)
  const itemsPerPage = 10

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProductos = productos.slice(startIndex, endIndex)
  const totalPages = Math.ceil(productos.length / itemsPerPage)

  const handleEliminarProducto = async (id: string) => {
    try {
      await CategoriasService.deleteProducto(id)
      onProductoDelete(id)
    } catch (error) {
      console.error('Error al eliminar producto:', error)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Productos de {categoria.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Proveedor</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProductos.map(producto => (
              <tr key={producto.id} className="border-b">
                <td className="px-4 py-2 font-medium">{producto.nombre}</td>
                <td className="px-4 py-2">{producto.descripcion || 'Sin descripción'}</td>
                <td className="px-4 py-2">
                  {producto.usuarios ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {producto.usuarios.nombres} {producto.usuarios.apellidos}
                      </span>
                    </div>
                  ) : producto.proveedor_id ? (
                    <span className="text-gray-500">ID: {producto.proveedor_id}</span>
                  ) : (
                    <span className="text-gray-400">Sin proveedor</span>
                  )}
                </td>
                <td className="px-4 py-2">${producto.precio_publico}</td>
                <td className="px-4 py-2">{producto.stock}</td>
                <td className="px-4 py-2">
                  {producto.imagen_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconEye />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="max-w-xs max-h-80 mx-auto"
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </td>
                <td className="px-4 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <IconMenu2 />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => setProductoDetalles(producto)}
                      >
                        <IconEye className="mr-2" /> Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEliminarProducto(producto.id)}
                        className="text-red-600"
                      >
                        <IconTrash className="mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage + 1} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>

        {/* Modal de detalles del producto */}
        <ProductoDetailsModal
          producto={productoDetalles}
          onClose={() => setProductoDetalles(null)}
          onUpdate={onProductoUpdate}
        />
      </CardContent>
    </Card>
  )
}
