import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import { diasRestantesMap, estadosMap, productoOpciones } from '../data/data'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { cn } from '@/lib/utils'
import { Compra } from '../data/schema'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export const columns: ColumnDef<Compra>[] = [

  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
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
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'producto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      const label = productoOpciones.find((label) => label.value === row.original.producto)

      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem]'>
            {row.getValue('producto')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'email_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),

  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      const badgeColor = estadosMap.get(estado)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {row.getValue('estado')}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'clave_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    cell: ({ row }) => {
      const [isVisible, setIsVisible] = useState(false)
      return (
        <div className='flex space-x-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem] cursor-pointer'
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? row.getValue('clave_cuenta') : '●●●●●●'}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isVisible ? 'Ocultar' : 'Mostrar'} la clave</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'url_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'perfil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'fecha_inicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de inicio' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'fecha_termino',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de término' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'monto_reembolso',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Monto de reembolso' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'nombre_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'telefono_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días restantes' />
    ),
    cell: ({ row }) => {
      const dias_restantes = row.getValue('dias_restantes') as number
      const badgeColor = diasRestantesMap.get(dias_restantes) as string
      return (
        <Badge className={cn('capitalize', badgeColor)}>
          {dias_restantes}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'opciones',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Opciones' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
