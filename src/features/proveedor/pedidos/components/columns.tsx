import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { estadosMap } from '../data/data'
import { PedidoEstado, Pedido } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Phone } from 'lucide-react'





// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

export const columns: ColumnDef<Pedido>[] = [
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
    id: 'numero',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      const rowIndex = row.index
      const numero = pageIndex * pageSize + rowIndex + 1
      
      return <div className='flex justify-center w-[80px] font-mono text-sm'>{numero}</div>
    },
    filterFn: (row, _id, value) => {
      // Calcular el número de la fila para el filtro
      const numero = row.index + 1
      return numero.toString().includes(value)
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'producto_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      const productoNombre = row.original.productos?.nombre
      
      return (
        <div className='flex justify-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem]'>
            {productoNombre || 'Sin producto'}
          </span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const productoNombre = row.original?.productos?.nombre?.toLowerCase() || ''
      return productoNombre.includes(value.toLowerCase())
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      const badgeColor = estadosMap.get(estado as PedidoEstado)
      return (
        <div className='flex justify-center space-x-2'>
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
    accessorKey: 'cliente_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      return <div className='flex justify-center'>{usuario?.nombres || row.getValue('nombre_cliente')}</div>
    },
    filterFn: (row, _id, value) => {
      const usuario = row.original.usuarios
      const nombreCliente = usuario?.nombres || row.original.nombre_cliente || ''
      const apellidoCliente = usuario?.apellidos || ''
      const nombreCompleto = `${nombreCliente} ${apellidoCliente}`.toLowerCase()
      return nombreCompleto.includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'telefono_whatsapp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      const telefono = usuario?.telefono || row.original.telefono_cliente
      
      if (!telefono) {
        return <div className='flex justify-center text-gray-400'>Sin teléfono</div>
      }
      
      return (
        <div className='flex justify-center w-[100px]'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-green-50'
            onClick={() => abrirWhatsApp(telefono as string)}
            title="Abrir en WhatsApp"
          >
            <div className='flex items-center space-x-1'>
              <Phone className='h-4 w-4 text-green-600' />
              <span className='text-xs text-green-600'>+{telefono}</span>
            </div>
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const precio = row.getValue('precio') as number
      return <div className='flex justify-center'>$ {precio.toFixed(2)}</div>
    },
  },
  {
    accessorKey: 'cuenta_email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email Cuenta' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const email = row.original.stock_productos?.email
      return (
        <div className='flex justify-center'>
          <span className='max-w-32 truncate text-sm sm:max-w-72 md:max-w-[15rem]'>
            {email || 'N/A'}
          </span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const email = row.original.stock_productos?.email || ''
      return email.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'cuenta_clave',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const clave = row.original.stock_productos?.clave
      return (
        <div className='flex justify-center'>
          <span className='max-w-24 truncate text-sm font-mono'>
            {clave || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'cuenta_url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.stock_productos?.url
      return (
        <div className='flex justify-center'>
          {url ? (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-blue-600 hover:text-blue-800 underline text-sm max-w-32 truncate'
            >
              {url}
            </a>
          ) : (
            <span className='text-sm'>N/A</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'perfil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const perfil = row.original.stock_productos?.perfil
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>
            {perfil || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const pin = row.original.stock_productos?.pin
      return (
        <div className='flex justify-center'>
          <span className='text-sm font-mono'>
            {pin || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_inicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Inicio' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaCreacion = row.original.created_at
      if (!fechaCreacion) return <div className='flex justify-center text-sm'>N/A</div>
      
      const fecha = new Date(fechaCreacion)
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>
            {fecha.toLocaleDateString('es-ES')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_fin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Fin' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      
      if (!fechaCreacion || !tiempoUso) {
        return <div className='flex justify-center text-sm'>N/A</div>
      }
      
      const fechaInicio = new Date(fechaCreacion)
      const fechaFin = new Date(fechaInicio.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
      
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>
            {fechaFin.toLocaleDateString('es-ES')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dias_duracion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días Duración' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const tiempoUso = row.original.productos?.tiempo_uso
      return (
        <div className='flex justify-center'>
          <span className='text-sm font-medium'>
            {tiempoUso ? `${tiempoUso} días` : 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Soporte',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

] 