import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { userTypes } from '../data/data'
import { MappedUser } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<MappedUser>[] = [
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
    id: 'nombreCompleto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Completo' />
    ),
    cell: ({ row }) => {
      const { nombres, apellidos } = row.original
      const nombreCompleto = `${nombres} ${apellidos}`
      return <LongText className='max-w-48'>{nombreCompleto}</LongText>
    },
    filterFn: (row, _id, value) => {
      const { nombres, apellidos } = row.original
      const nombreCompleto = `${nombres} ${apellidos}`.toLowerCase()
      return nombreCompleto.includes(value.toLowerCase())
    },
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
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return (
        <div className='font-mono text-sm max-w-48 truncate'>
          {email || (
            <span className='text-muted-foreground italic'>Sin email</span>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'usuario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usuario' />
    ),
    cell: ({ row }) => {
      const usuario = row.getValue('usuario') as string
      return (
        <div className='font-mono text-sm'>
          {usuario || (
            <span className='text-muted-foreground italic'>Sin usuario</span>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => {
      const telefono = row.getValue('telefono') as string | null
      return (
        <div className='font-mono text-sm'>
          {telefono || (
            <span className='text-muted-foreground italic'>Sin teléfono</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'codigo_referido',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código Referido' />
    ),
    cell: ({ row }) => {
      const codigoReferido = row.getValue('codigo_referido') as string
      return (
        <div className='font-mono text-sm'>
          {codigoReferido ? (
            <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
              {codigoReferido}
            </span>
          ) : (
            <span className='text-muted-foreground italic'>Sin código</span>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'saldo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Saldo' className='text-right' />
    ),
    cell: ({ row }) => {
      const saldo = row.getValue('saldo') as number
      const safeSaldo = saldo || 0
      const formatted = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
      }).format(safeSaldo)
      
      return (
        <div className='text-left font-mono text-sm'>
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            safeSaldo > 0 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : safeSaldo < 0 
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            {formatted}
          </span>
        </div>
      )
    },
    enableSorting: true,
    meta: {
      className: 'text-left',
    },
  },
  {
    accessorKey: 'rol',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => {
      const { rol } = row.original
      const userType = userTypes.find(({ value }) => value === rol)

      if (!userType) {
        return null
      }

      return (
        <div className='flex items-center gap-x-2'>
          {userType.icon && (
            <userType.icon size={16} className='text-muted-foreground' />
          )}
          <span className='text-sm capitalize'>{userType.label}</span>
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
    accessorKey: 'referido_por_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Referido Por' />
    ),
    cell: ({ row }) => {
      const referidoPorNombre = row.getValue('referido_por_nombre') as string | null
      return (
        <div className='text-sm'>
          {referidoPorNombre ? (
            <span className='inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200'>
              {referidoPorNombre}
            </span>
          ) : (
            <span className='text-muted-foreground italic'>Registro directo</span>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
