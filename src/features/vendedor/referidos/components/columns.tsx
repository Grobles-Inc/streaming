import { Checkbox } from '@/components/ui/checkbox'
import { ColumnDef } from '@tanstack/react-table'
import { Referido } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { Button } from '@/components/ui/button'

export const columns: ColumnDef<Referido>[] = [
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
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID ' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'usuarios',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código de referido' />
    ),
    cell: ({ row }) => {
      const { usuarios } = row.original
      if (!usuarios) return null
      return (
        <div className='flex items-center'>
          <span>{usuarios.codigo_referido}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'nombres',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombres' />
    ),
    enableSorting: false,

  },
  {
    accessorKey: 'apellidos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Apellidos' />
    ),
    enableSorting: false,
  },

  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => {
      return (
        <a href={`https://wa.me/${row.getValue('telefono')}?text=Hola, que tal `} target='_blank' rel='noopener noreferrer'>
          <Button variant='ghost' size='icon' className='flex flex-col items-center gap-0'>
            <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
            <span className='text-green-500 text-[9px]'>
              {row.getValue('telefono')}
            </span>
          </Button>
        </a>
      )
    },
    enableSorting: false,
  },
]
