import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { IconEye, IconEdit, IconTrash, IconMenu2, IconGripVertical, IconArrowUp, IconArrowDown } from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Categoria } from '../data/types'

interface SortableRowProps {
  categoria: Categoria
  onEdit: (categoria: Categoria) => void
  onDelete: (id: string) => void
  onMoveToFirst: (categoria: Categoria) => void
  onMoveToLast: (categoria: Categoria) => void
  isDragMode: boolean
}

function SortableRow({ categoria, onEdit, onDelete, onMoveToFirst, onMoveToLast, isDragMode }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoria.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-secondary/10 ${isDragging ? 'bg-secondary/20' : ''}`}
    >
      <td className="pr-4 py-4 text-center">
        {isDragMode ? (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <IconGripVertical className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">{categoria.orden}</span>
        )}
      </td>
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
            <Button size="sm" variant="outline" disabled={isDragMode}>
              <IconMenu2 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(categoria)}>
              <IconEdit className="mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onMoveToFirst(categoria)}>
              <IconArrowUp className="mr-2" /> Mover al principio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMoveToLast(categoria)}>
              <IconArrowDown className="mr-2" /> Mover al final
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
  )
}

interface CategoriasTableDndProps {
  categorias: Categoria[]
  onEdit: (categoria: Categoria) => void
  onDelete: (id: string) => void
  onReorder: (reorderedCategorias: Categoria[]) => void
  onMoveToFirst: (categoria: Categoria) => void
  onMoveToLast: (categoria: Categoria) => void
}

export function CategoriasTableDnd({
  categorias,
  onEdit,
  onDelete,
  onReorder,
  onMoveToFirst,
  onMoveToLast
}: CategoriasTableDndProps) {
  const [isDragMode, setIsDragMode] = useState(false)
  
  // Ordenar categorías por campo orden
  const sortedCategorias = [...categorias].sort((a, b) => a.orden - b.orden)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      // Encontrar los índices en el array completo de categorías ordenadas
      const oldIndex = sortedCategorias.findIndex((cat) => cat.id === active.id)
      const newIndex = sortedCategorias.findIndex((cat) => cat.id === over.id)
      
      // Reordenar el array completo
      const reorderedCategorias = arrayMove(sortedCategorias, oldIndex, newIndex)
      
      // Actualizar el campo orden para cada categoría
      const categoriasWithNewOrder = reorderedCategorias.map((categoria, index) => ({
        ...categoria,
        orden: index + 1
      }))
      
      onReorder(categoriasWithNewOrder)
    }
  }

  const toggleDragMode = () => {
    setIsDragMode(!isDragMode)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Categorías</h3>
        <Button 
          onClick={toggleDragMode}
          variant={isDragMode ? "default" : "outline"}
          className="mb-2"
        >
          {isDragMode ? "Finalizar reordenamiento" : "Reordenar categorías"}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="w-full text-sm text-left mb-6">
          <thead>
            <tr>
              <th className="pr-4 py-2 text-center w-20">
                {isDragMode ? "Mover" : "Orden"}
              </th>
              <th className="pr-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Creado en:</th>
              <th className="px-4 py-2">Actualizado en:</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <SortableContext 
              items={sortedCategorias.map(cat => cat.id)} 
              strategy={verticalListSortingStrategy}
            >
              {sortedCategorias.map(categoria => (
                <SortableRow
                  key={categoria.id}
                  categoria={categoria}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMoveToFirst={onMoveToFirst}
                  onMoveToLast={onMoveToLast}
                  isDragMode={isDragMode}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>

      {/* Información de total de categorías */}
      <div className="flex justify-center items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Total de categorías: {sortedCategorias.length}
        </span>
      </div>
    </>
  )
}
