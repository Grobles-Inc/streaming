import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { IconCheck, IconX, IconEyeOff } from '@tabler/icons-react'
import { tipos, estados, estadosBool } from '../data/data'
import { Cuenta } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Cuenta>[] = [
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
    accessorKey: 'productos.nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      const producto = row.original.productos
      return (
        <LongText className='max-w-48 font-medium'>
          {producto?.nombre || 'Sin producto'}
        </LongText>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      const tipoInfo = tipos.find(t => t.value === tipo)
      
      if (!tipoInfo) return null
      
      return (
        <Badge variant='outline' className={cn('text-xs', tipoInfo.color)}>
          <tipoInfo.icon size={12} className='mr-1' />
          {tipoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return email ? (
        <LongText className='max-w-48 font-mono text-sm'>{email}</LongText>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'clave',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    cell: ({ row }) => {
      const clave = row.getValue('clave') as string
      return clave ? (
        <div className='flex items-center space-x-2'>
          <span className='font-mono text-sm'>{'*'.repeat(8)}</span>
          <IconEyeOff size={14} className='text-muted-foreground' />
        </div>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
    meta: { className: 'w-32' },
    enableSorting: false,
  },
  {
    accessorKey: 'url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    cell: ({ row }) => {
      const url = row.getValue('url') as string
      return url ? (
        <LongText className='max-w-32 text-blue-600'>
          <a href={url} target='_blank' rel='noopener noreferrer' className='hover:underline'>
            {url}
          </a>
        </LongText>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
    meta: { className: 'w-32' },
    enableSorting: false,
  },
  {
    accessorKey: 'perfil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    cell: ({ row }) => {
      const perfil = row.getValue('perfil') as string
      return perfil ? (
        <LongText className='max-w-32'>{perfil}</LongText>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    cell: ({ row }) => {
      const pin = row.getValue('pin') as string
      return pin ? (
        <div className='font-mono text-sm'>{'*'.repeat(4)}</div>
      ) : (
        <span className='text-muted-foreground text-sm'>—</span>
      )
    },
    meta: { className: 'w-20' },
    enableSorting: false,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Creado' />
    ),
    cell: ({ row }) => {
      const fecha = row.getValue('created_at') as string
      const date = new Date(fecha)
      return (
        <div className='text-sm'>
          {date.toLocaleDateString('es-ES')}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string
      const estadoInfo = estados.find(e => e.value === estado)
      
      if (!estadoInfo) return null
      
      return (
        <Badge variant='outline' className={cn('text-xs border rounded-full px-2', estadoInfo.color)}>
          <estadoInfo.icon size={12} className='mr-1' />
          {estadoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { className: 'w-32' },
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
        <Badge variant='outline' className={cn('text-xs border rounded-full px-2', badgeColor)}>
          {publicado ? <IconCheck size={12} className='mr-1' /> : <IconX size={12} className='mr-1' />}
          {publicado ? 'Sí' : 'No'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const publicado = row.getValue(id) as boolean
      return value.includes(publicado.toString())
    },
    meta: { className: 'w-24' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: cn(
        'sticky right-0 z-10',
        'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
    enableSorting: false,
    enableHiding: false,
  },
] 