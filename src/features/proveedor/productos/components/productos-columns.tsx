import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { IconCheck, IconX, IconPackage, IconClock, IconShoppingCart } from '@tabler/icons-react'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import type { Producto } from '../data/schema'

// Estados para badges
const disponibilidadColors = {
  'en_stock': 'text-green-600 bg-green-50 border-green-200',
  'a_pedido': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'activacion': 'text-blue-600 bg-blue-50 border-blue-200',
}

const disponibilidadIcons = {
  'en_stock': IconPackage,
  'a_pedido': IconClock,
  'activacion': IconShoppingCart,
}

const disponibilidadLabels = {
  'en_stock': 'En Stock',
  'a_pedido': 'A Pedido',
  'activacion': 'Activación',
}

export const columns: ColumnDef<Producto>[] = [
  // Columna oculta para evitar errores de tabla
  {
    accessorKey: 'destacado',
    header: 'Destacado',
    enableHiding: true,
    meta: { className: 'hidden' },
    cell: () => null,
  },
  {
    accessorKey: 'mas_vendido',
    header: 'Más vendido',
    enableHiding: true,
    meta: { className: 'hidden' },
    cell: () => null,
  },
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
      <div className='w-12 font-mono text-sm'>{(row.getValue('id') as string)?.slice(0, 8)}</div>
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
    cell: ({ row }) => {
      const producto = row.original
      return (
        <div className='flex items-center space-x-2'>
          <LongText className='max-w-48 font-medium'>{row.getValue('nombre')}</LongText>
          <div className='flex space-x-1'>
            {producto.nuevo && (
              <Badge variant='secondary' className='text-xs'>
                Nuevo
              </Badge>
            )}
          </div>
        </div>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'categorias',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Categoría' />
    ),
    cell: ({ row }) => {
      const producto = row.original
      const categoria = producto.categorias
      if (!categoria) return <span className='text-gray-400'>Sin categoría</span>

      return (
        <Badge variant='outline' className='text-xs'>
          {categoria.nombre}
        </Badge>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'precio_vendedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Vendedor' />
    ),
    cell: ({ row }) => {
      const precio = row.getValue('precio_vendedor') as number
      return (
        <div className='font-medium text-blue-600'>
          $. {precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'precio_publico',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Público' />
    ),
    cell: ({ row }) => {
      const precio = row.getValue('precio_publico') as number
      return (
        <div className='font-medium text-green-600'>
          $. {precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'precio_renovacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Renovación' />
    ),
    cell: ({ row }) => {
      const precio = row.getValue('precio_renovacion') as number | null
      return (
        <div className='font-medium text-orange-600'>
          {precio ? `$.${precio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : 'N/A'}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'stock_de_productos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock Disponible' />
    ),
    cell: ({ row }) => {
      const stockDeProductos = row.getValue('stock_de_productos') as { id: number }[] | null
      const cantidadStock = stockDeProductos?.length || 0

      return (
        <div className='text-center'>
          <span className={`font-bold text-sm ${cantidadStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {cantidadStock}
          </span>
          <div className='text-xs text-muted-foreground'>
            {cantidadStock === 1 ? 'cuenta' : 'cuentas'}
          </div>
        </div>
      )
    },
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'disponibilidad',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Disponibilidad' />
    ),
    cell: ({ row }) => {
      const disponibilidad = row.getValue('disponibilidad') as keyof typeof disponibilidadColors
      const Icon = disponibilidadIcons[disponibilidad]
      const color = disponibilidadColors[disponibilidad]
      const label = disponibilidadLabels[disponibilidad]

      return (
        <Badge variant='outline' className={cn('text-xs', color)}>
          <Icon size={12} className='mr-1' />
          {label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as 'borrador' | 'publicado'

      return (
        <Badge 
          variant='outline' 
          className={cn(
            'text-xs',
            estado === 'publicado' 
              ? 'text-green-600 bg-green-50 border-green-200' 
              : 'text-orange-600 bg-orange-50 border-orange-200'
          )}
        >
          {estado === 'publicado' ? 'Publicado' : 'Borrador'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'tiempo_uso',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tiempo (días)' />
    ),
    cell: ({ row }) => {
      const tiempo = row.getValue('tiempo_uso') as number
      return (
        <div className='text-sm font-medium'>
          {tiempo} {tiempo === 1 ? 'día' : 'días'}
        </div>
      )
    },
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'renovable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Renovable' />
    ),
    cell: ({ row }) => {
      const renovable = row.getValue('renovable') as boolean

      return (
        <Badge variant='outline' className={cn(
          'text-xs',
          renovable ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
        )}>
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
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'a_pedido',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='A Pedido' />
    ),
    cell: ({ row }) => {
      const aPedido = row.getValue('a_pedido') as boolean

      return (
        <Badge variant='outline' className={cn(
          'text-xs',
          aPedido ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-gray-600 bg-gray-50 border-gray-200'
        )}>
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
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Creado' />
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('created_at') as string)
      return (
        <div className='text-sm'>
          {fecha.toLocaleDateString('es-ES')}
        </div>
      )
    },
    meta: { className: 'w-28' },
  },
  {
    accessorKey: 'nuevo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nuevo' />
    ),
    cell: ({ row }) => {
      const nuevo = row.getValue('nuevo') as boolean

      return (
        <Badge variant='outline' className={cn(
          'text-xs',
          nuevo ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-600 bg-gray-50 border-gray-200'
        )}>
          {nuevo ? (
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
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'descripcion_completa',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descripción Completa' />
    ),
    cell: ({ row }) => {
      const descripcionCompleta = row.getValue('descripcion_completa') as string | null
      return (
        <div className='text-sm max-w-48'>
          {descripcionCompleta ? (
            <LongText>{descripcionCompleta}</LongText>
          ) : 'N/A'}
        </div>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'solicitud',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Solicitud' />
    ),
    cell: ({ row }) => {
      const solicitud = row.getValue('solicitud') as string | null
      return (
        <div className='text-sm max-w-32'>
          {solicitud ? (
            <LongText>{solicitud}</LongText>
          ) : 'N/A'}
        </div>
      )
    },
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'muestra_disponibilidad_stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Muestra Stock' />
    ),
    cell: ({ row }) => {
      const muestraStock = row.getValue('muestra_disponibilidad_stock') as boolean

      return (
        <Badge variant='outline' className={cn(
          'text-xs',
          muestraStock ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'
        )}>
          {muestraStock ? (
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
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'deshabilitar_boton_comprar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Botón Deshabilitado' />
    ),
    cell: ({ row }) => {
      const deshabilitado = row.getValue('deshabilitar_boton_comprar') as boolean

      return (
        <Badge variant='outline' className={cn(
          'text-xs',
          deshabilitado ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'
        )}>
          {deshabilitado ? (
            <><IconX size={12} className='mr-1' />Sí</>
          ) : (
            <><IconCheck size={12} className='mr-1' />No</>
          )}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: { className: 'w-24' },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: cn(
        'sticky right-0 bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
      ),
    },
  },
] 