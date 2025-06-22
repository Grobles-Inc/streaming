import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { estadosMap } from '../data/data'
import { Recarga } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'

export const columns: ColumnDef<Recarga>[] = [
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
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return <div className='w-[80px]'>{id.slice(0, 6)}</div>
    },
    enableSorting: false,
    enableHiding: false,
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
    enableSorting: false,
    enableHiding: false,
  },


  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{new Date(row.getValue('created_at')).toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
    enableHiding: false,

  }, {
    accessorKey: 'metodo_pago',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Método de pago' />
    ),
    cell: ({ row }) => {
      return <div className='flex items-center'>{row.getValue('metodo_pago')}</div>
    },
    enableSorting: false,
  }, {
    accessorKey: 'monto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Monto' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span >$ {row.getValue('monto')}</span>
        </div>
      )
    },
    enableHiding: false,
  }, {
    accessorKey: 'comision',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Comisión' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span >$ {row.getValue('comision')}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'saldo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Saldo" />
    ),
    cell: ({ row }) => {
      const saldo = row.original.monto - row.original.comision
      return <div className='flex items-center'>
        <span className='font-bold'>$ {saldo}</span>
      </div>
    },
    enableSorting: false,
  }

]
