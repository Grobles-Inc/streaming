import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconSearch, IconPlus, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'
import { DataTableViewOptions } from './data-table-view-options'
import type { Table } from '@tanstack/react-table'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row'] & {
  producto?: {
    id: string
    nombre: string
  }
}

type Producto = {
  id: string
  nombre: string
}

interface StockToolbarProps {
  table: Table<StockProducto>
  productos?: Producto[]
  onAgregarStock: () => void
  onDeleteSelected?: (selectedIds: number[]) => void
  onTogglePublishedSelected?: (selectedIds: number[], published: boolean) => void
}

export function StockToolbar({ 
  table, 
  onAgregarStock, 
  onDeleteSelected, 
  onTogglePublishedSelected
}: StockToolbarProps) {
  const globalFilter = table.getState().globalFilter ?? ''
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedRows.length > 0) {
      const selectedIds = selectedRows.map(row => row.original.id)
      onDeleteSelected(selectedIds)
    }
  }

  const handleTogglePublishedSelected = (published: boolean) => {
    if (onTogglePublishedSelected && selectedRows.length > 0) {
      const selectedIds = selectedRows.map(row => row.original.id)
      onTogglePublishedSelected(selectedIds, published)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Acciones en lote cuando hay filas seleccionadas */}
      {hasSelectedRows && (
        <div className='flex items-center gap-2 p-3 bg-muted/50 border rounded-lg'>
          <span className='text-sm text-muted-foreground'>
            {selectedRows.length} fila(s) seleccionada(s)
          </span>
          <div className='flex items-center gap-2 ml-auto'>
            {onTogglePublishedSelected && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleTogglePublishedSelected(true)}
                  className='h-8'
                >
                  <IconEye className='mr-2 h-4 w-4' />
                  Publicar
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleTogglePublishedSelected(false)}
                  className='h-8'
                >
                  <IconEyeOff className='mr-2 h-4 w-4' />
                  Despublicar
                </Button>
              </>
            )}
            {onDeleteSelected && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleDeleteSelected}
                className='h-8 text-red-600 hover:text-red-700'
              >
                <IconTrash className='mr-2 h-4 w-4' />
                Eliminar
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Toolbar principal */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <Button onClick={onAgregarStock}>
          <IconPlus className='mr-2 h-4 w-4' />
          Agregar Stock
        </Button>
      </div>
      {/* Filtros */}
      <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
        <div className='relative'>
          <IconSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar stock...'
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className='pl-10 w-full sm:w-64'
          />
        </div>
        
        
        <Select
          value={(table.getColumn('tipo')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => {
            table.getColumn('tipo')?.setFilterValue(value === 'todos' ? '' : value)
          }}
        >
          <SelectTrigger className='w-full sm:w-32'>
            <SelectValue placeholder='Tipo' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos</SelectItem>
            <SelectItem value='cuenta'>Cuenta</SelectItem>
            <SelectItem value='perfiles'>Perfiles</SelectItem>
            <SelectItem value='combo'>Combo</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={(table.getColumn('estado')?.getFilterValue() as string) ?? ''}
          onValueChange={(value) => {
            table.getColumn('estado')?.setFilterValue(value === 'todos' ? '' : value)
          }}
        >
          <SelectTrigger className='w-full sm:w-32'>
            <SelectValue placeholder='Estado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos</SelectItem>
            <SelectItem value='disponible'>Disponible</SelectItem>
            <SelectItem value='vendido'>Vendido</SelectItem>
          </SelectContent>
        </Select>
        
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
} 