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
  }, {
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

  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return <div className='w-[80px]'>R-{id.slice(0, 6)}</div>
    },
    enableSorting: false,
  },

  {
    accessorKey: 'detalle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Detalles' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      return (
        <p className='text-sm text-muted-foreground'>
          {estado === 'aprobado' ? 'Tu recarga ha sido aprobada y acreditada en tu billetera.' : estado === 'pendiente' ? 'Procesando tu recarga. Esto puede tardar unos minutos.' : 'Tu recarga ha sido rechazada.'}
        </p>
      )
    },
    enableSorting: false,
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
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {row.getValue('estado')}
        </Badge>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'monto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Monto' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>$ {(row.getValue('monto') as number).toFixed(2)}</span>
        </div>
      )
    },
    enableSorting: false,
  },
]
