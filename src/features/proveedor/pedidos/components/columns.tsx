import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Phone } from 'lucide-react'
import { useEffect } from 'react'
import { estadosMap } from '../data/data'
import { Pedido, PedidoEstado } from '../data/schema'
import { useUpdatePedidoStatusVencido } from '../queries'
import { calcularFechaExpiracion, formatearFechaParaMostrar } from '../utils/fecha-utils'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'





// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

// Componente para manejar días restantes con actualización automática
const DiasRestantesCell = ({ fecha_expiracion, id }: { fecha_expiracion: string, id: number | undefined }) => {
  const { mutate: updatePedidoStatusVencido } = useUpdatePedidoStatusVencido()
  const fecha_actual = new Date()
  const fecha_expiracion_date = fecha_expiracion ? new Date(fecha_expiracion) : null
  const dias_restantes = fecha_expiracion_date ? Math.ceil((fecha_expiracion_date.getTime() - fecha_actual.getTime()) / (1000 * 60 * 60 * 24)) : null

  // For tablas grandes/infinite scroll, dispara el update solo una vez por id para evitar loops y race conditions.
  // Usa un Set global para trackear ids ya actualizados en esta sesión.
  const updatedIds = (window as any).__diasRestantesUpdatedIds || ((window as any).__diasRestantesUpdatedIds = new Set<number>())

  useEffect(() => {
    if (dias_restantes === 0 && id && !updatedIds.has(id)) {
      updatedIds.add(id)
      updatePedidoStatusVencido(id)
    }
    // No dependas de updateCompraStatus para evitar re-triggers innecesarios
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias_restantes, id])

  let badgeColor = ''
  if (dias_restantes === null) {
    badgeColor = 'bg-gray-500 text-white dark:text-white border-gray-500'
  } else if (dias_restantes <= 0) {
    badgeColor = 'bg-red-500 text-white dark:text-white border-red-500'
  } else if (dias_restantes < 10) {
    badgeColor = 'bg-orange-400 text-white dark:text-white border-orange-500'
  } else if (dias_restantes < 30) {
    badgeColor = 'bg-green-500 text-white dark:text-white border-green-500'
  }
  return (
    <div className='flex justify-center'>
      {
        dias_restantes === null ? (
          <Badge variant='destructive' className={badgeColor}>
            Sin activar
          </Badge>
        ) : (
          <Badge className={cn('capitalize h-7 w-7 rounded-full', badgeColor)}>
            {dias_restantes <= 0 ? '0' : dias_restantes}
          </Badge>
        )
      }

    </div>
  )
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string

      return <div className='flex justify-center w-[80px] font-mono text-sm'>{id}</div>
    },
    filterFn: (row, _id, value) => {
      const id = row.getValue('id') as string
      return id.toString().includes(value)
    },
    enableSorting: false,
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
            {estado}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as string
      return value.includes(estado)
    },
    enableHiding: false,
    enableSorting: false,
  },


  {
    accessorKey: 'cliente_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendedor' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      const nombreCompleto = `${usuario?.nombres} ${usuario?.apellidos}`
      return <div className='flex justify-center'>{nombreCompleto || 'Sin Vendedor'}</div>
    },
    filterFn: (row, _id, value) => {
      const usuario = row.original.usuarios
      const nombreCliente = usuario?.nombres || ''
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
      const telefono = usuario?.telefono

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
              <span className='text-xs text-green-600'>{telefono}</span>
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
    accessorKey: 'precio_renovacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Renovación' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const precioRenovacion = row.original.productos?.precio_renovacion
      return (
        <div className='flex justify-center'>
          {precioRenovacion !== null && precioRenovacion !== undefined
            ? `$ ${precioRenovacion.toFixed(2)}`
            : 'N/A'
          }
        </div>
      )
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
      const fechaInicio = row.original.fecha_inicio
      const fechaCreacion = row.original.created_at
      const renovado = row.original.renovado

      // Verificar si es una renovación por vendedor usando la columna renovado
      const esRenovadoPorVendedor = renovado === true

      // Si tiene fecha_inicio explícita, usar esa
      if (fechaInicio) {
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
              {formatearFechaParaMostrar(fechaInicio)}
            </span>
          </div>
        )
      }

      // Si no, usar created_at (fecha original)
      if (!fechaCreacion) return <div className='flex justify-center text-sm'>N/A</div>

      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
            {formatearFechaParaMostrar(fechaCreacion)}
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
      const fechaExpiracion = row.original.fecha_expiracion
      const fechaInicio = row.original.fecha_inicio
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      const renovado = row.original.renovado

      // Verificar si es una renovación por vendedor usando la columna renovado
      const esRenovadoPorVendedor = renovado === true

      // Si tiene fecha_expiracion explícita (renovación), usar esa
      if (fechaExpiracion) {
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
              {formatearFechaParaMostrar(fechaExpiracion)}
            </span>
          </div>
        )
      }

      // Si no, calcular usando la fecha de inicio (renovada o original) + tiempo_uso
      let fechaInicioCalcular = fechaCreacion
      if (fechaInicio) {
        fechaInicioCalcular = fechaInicio
      }

      if (!fechaInicioCalcular || !tiempoUso) {
        return <div className='flex justify-center text-sm'>N/A</div>
      }

      const fechaFin = calcularFechaExpiracion(fechaInicioCalcular, tiempoUso)

      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
            {formatearFechaParaMostrar(fechaFin)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días Restantes' />
    ),
    enableSorting: false,
    cell: ({ row }) => <DiasRestantesCell fecha_expiracion={row.original.fecha_expiracion as string} id={row.original.id} />,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

] 