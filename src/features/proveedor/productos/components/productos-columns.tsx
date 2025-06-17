import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { IconCheck, IconX } from '@tabler/icons-react'
import { categorias, estadosBool } from '../data/data'
import { Producto } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Producto>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <div className='w-12 font-mono text-sm'>{row.getValue('id')}</div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
        'sticky left-6 md:table-cell'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 font-medium'>{row.getValue('nombre')}</LongText>
    ),
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('proveedor')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'categorias',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Categorías' />
    ),
    cell: ({ row }) => {
      const categoriasList = row.getValue('categorias') as string[]
      
      return (
        <div className='flex flex-wrap gap-1 max-w-48'>
          {categoriasList.map((cat) => {
            const categoria = categorias.find(c => c.value === cat)
            if (!categoria) return null
            
            return (
              <Badge 
                key={cat} 
                variant='outline' 
                className={cn('text-xs', categoria.color)}
              >
                <categoria.icon size={12} className='mr-1' />
                {categoria.label}
              </Badge>
            )
          })}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const categoriasList = row.getValue(id) as string[]
      return value.some((val: string) => categoriasList.includes(val))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    cell: ({ row }) => {
      const precio = row.getValue('precio') as number
      return (
        <div className='font-medium'>
          ${precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      return (
        <div className={cn(
          'font-medium',
          stock > 20 ? 'text-green-600' : stock > 5 ? 'text-yellow-600' : 'text-red-600'
        )}>
          {stock}
        </div>
      )
    },
    meta: { className: 'w-20' },
  },
  {
    accessorKey: 'fechaInicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Inicio' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaInicio') as Date
      return (
        <div className='text-sm'>
          {fecha.toLocaleDateString('es-ES')}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'fechaFinalizacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Fin' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('fechaFinalizacion') as Date
      return (
        <div className='text-sm'>
          {fecha.toLocaleDateString('es-ES')}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'renovable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Renovable' />
    ),
    cell: ({ row }) => {
      const renovable = row.getValue('renovable') as boolean
      const badgeColor = estadosBool.get(renovable)
      
      return (
        <Badge variant='outline' className={cn('text-xs', badgeColor)}>
          {renovable ? (
            <><IconCheck size={12} className='mr-1' />Sí</>
          ) : (
            <><IconX size={12} className='mr-1' />No</>
          )}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'aPedido',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='A Pedido' />
    ),
    cell: ({ row }) => {
      const aPedido = row.getValue('aPedido') as boolean
      const badgeColor = estadosBool.get(aPedido)
      
      return (
        <Badge variant='outline' className={cn('text-xs', badgeColor)}>
          {aPedido ? (
            <><IconCheck size={12} className='mr-1' />Sí</>
          ) : (
            <><IconX size={12} className='mr-1' />No</>
          )}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'publicado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Publicado' />
    ),
    cell: ({ row }) => {
      const publicado = row.getValue('publicado') as boolean
      const badgeColor = estadosBool.get(publicado)
      
      return (
        <Badge variant='outline' className={cn('text-xs', badgeColor)}>
          {publicado ? (
            <><IconCheck size={12} className='mr-1' />Sí</>
          ) : (
            <><IconX size={12} className='mr-1' />No</>
          )}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: { className: 'w-24' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
    meta: { className: 'w-12' },
  },
] 