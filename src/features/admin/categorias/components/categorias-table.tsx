import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconEye, IconEdit, IconTrash, IconMenu2 } from '@tabler/icons-react'
import type { Categoria } from '../data/types'

interface CategoriasTableProps {
  categorias: Categoria[]
  currentPage: number
  itemsPerPage?: number
  onEdit: (categoria: Categoria) => void
  onDelete: (id: string) => void
  onPageChange: (page: number) => void
}

export function CategoriasTable({
  categorias,
  currentPage,
  itemsPerPage = 10,
  onEdit,
  onDelete,
  onPageChange
}: CategoriasTableProps) {
  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCategorias = categorias.slice(startIndex, endIndex)
  const totalPages = Math.ceil(categorias.length / itemsPerPage)

  return (
    <>
      <table className="w-full text-sm text-left mb-6">
        <thead>
          <tr>
            <th className="pr-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Creado en:</th>
            <th className="px-4 py-2">Actualizado en:</th>
            <th className="px-4 py-2">Imagen</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCategorias.map(categoria => (
            <tr
              key={categoria.id}
              className="border-b hover:bg-secondary/10"
            >
              <td className="pr-4 py-4 text-left font-medium">{categoria.nombre}</td>
              <td className="px-4 py-4">{categoria.descripcion || 'Sin descripción'}</td>
              <td className="px-4 py-4">{new Date(categoria.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-4">{new Date(categoria.updated_at).toLocaleDateString()}</td>
              <td className="px-4 py-4">
                {categoria.imagen_url && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <IconEye />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <img
                        src={categoria.imagen_url}
                        alt={categoria.nombre}
                        className="max-w-xs max-h-80 mx-auto"
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </td>
              <td className="px-4 py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <IconMenu2 />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEdit(categoria)}>
                      <IconEdit className="mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(categoria.id)}
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
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-600">
          Página {currentPage + 1} de {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente
        </Button>
      </div>
    </>
  )
}
