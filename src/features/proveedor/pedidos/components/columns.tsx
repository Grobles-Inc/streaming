import { useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { estadosMap } from '../data/data'
import { Pedido, PedidoEstado } from '../data/schema'
import { useUpdatePedidoStatusVencido } from '../queries'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

const MS_PER_DAY = 1000 * 60 * 60 * 24

const getUtcMidnightMs = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

const getUtcDayDiff = (targetDate: Date, baseDate = new Date()) =>
  (getUtcMidnightMs(targetDate) - getUtcMidnightMs(baseDate)) / MS_PER_DAY

const getPedidoEstadoByFecha = (
  estado: PedidoEstado,
  fechaExpiracion?: string | null
) => {
  if (!fechaExpiracion) {
    return estado
  }

  const diasRestantes = getUtcDayDiff(new Date(fechaExpiracion))
  return diasRestantes <= 0 ? 'vencido' : 'resuelto'
}

// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

// Componente para manejar días restantes con actualización automática
const DiasRestantesCell = ({
  fecha_expiracion,
  id,
}: {
  fecha_expiracion: string
  id: number | undefined
}) => {
  const { mutate: updatePedidoStatusVencido } = useUpdatePedidoStatusVencido()

  let diasRestantes: number | null = null

  if (fecha_expiracion) {
    diasRestantes = getUtcDayDiff(new Date(fecha_expiracion as string))
  }

  const updatedIds =
    (window as any).__diasRestantesUpdatedIds ||
    ((window as any).__diasRestantesUpdatedIds = new Set<number>())

  useEffect(() => {
    if (
      diasRestantes !== null &&
      diasRestantes <= 0 &&
      id &&
      !updatedIds.has(id)
    ) {
      updatedIds.add(id)
      updatePedidoStatusVencido(id as number)
    }
  }, [diasRestantes, id])

  let badgeColor = ''
  if (diasRestantes === null) {
    badgeColor = 'bg-gray-500 text-white dark:text-white border-gray-500'
  } else if (diasRestantes <= 0) {
    badgeColor = 'bg-red-500 text-white dark:text-white border-red-500'
  } else if (diasRestantes < 10) {
    badgeColor = 'bg-orange-400 text-white dark:text-white border-orange-500'
  } else if (diasRestantes < 30) {
    badgeColor = 'bg-green-500 text-white dark:text-white border-green-500'
  }

  return (
    <div className='flex justify-center'>
      {diasRestantes === null ? (
        <Badge variant='destructive' className={badgeColor}>
          Sin activar
        </Badge>
      ) : (
        <Badge className={cn('h-7 w-7 rounded-full capitalize', badgeColor)}>
          {diasRestantes}
        </Badge>
      )}
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
    header: 'ID',

    filterFn: (row, _id, value) => {
      const id = row.getValue('id') as string
      return id.toString().includes(value)
    },
    enableSorting: false,
  },
  {
    accessorKey: 'producto_nombre',
    header: 'Producto',
    cell: ({ row }) => {
      const productoNombre = row.original.productos?.nombre

      return (
        <span className='truncate'>{productoNombre || 'Sin producto'}</span>
      )
    },
    filterFn: (row, _id, value) => {
      const productoNombre =
        row.original?.productos?.nombre?.toLowerCase() || ''
      return productoNombre.includes(value.toLowerCase())
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const { estado, fecha_expiracion: fechaExpiracion } = row.original
      const estadoCalculado = getPedidoEstadoByFecha(
        estado as PedidoEstado,
        fechaExpiracion as string
      )
      const badgeColor = estadosMap.get(estadoCalculado)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {estadoCalculado}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      const estado = getPedidoEstadoByFecha(
        row.original.estado as PedidoEstado,
        row.original.fecha_expiracion as string
      )
      return value.includes(estado)
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: 'usuario',
    header: 'Vendedor',
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      return (
        <span className='truncate'>{usuario?.usuario || 'Sin Vendedor'}</span>
      )
    },
    filterFn: (row, _id, value) => {
      const usuario = row.original.usuarios
      const nombreUsuario = usuario?.usuario?.toLowerCase() || ''
      return nombreUsuario.includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'telefono_whatsapp',
    header: 'Teléfono',
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      const telefono = usuario?.telefono

      if (!telefono) {
        return <span className='text-gray-400'>Sin teléfono</span>
      }

      return (
        <button
          className='flex flex-col items-center hover:opacity-60'
          onClick={() => abrirWhatsApp(telefono as string)}
          title='Abrir en WhatsApp'
        >
          <img
            src='https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000'
            className='size-6'
          />
          <span className='text-[9px] text-green-500'>{telefono}</span>
        </button>
      )
    },
  },
  {
    accessorKey: 'precio',
    header: 'Precio',
    enableSorting: false,
    cell: ({ row }) => {
      const precio = row.getValue('precio') as number
      return <span>$ {precio.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'precio_renovacion',
    header: 'P. Renovación',
    enableSorting: false,
    cell: ({ row }) => {
      const precioRenovacion = row.original.productos?.precio_renovacion
      return (
        <span>
          {precioRenovacion !== null && precioRenovacion !== undefined
            ? `$ ${precioRenovacion.toFixed(2)}`
            : 'N/A'}
        </span>
      )
    },
  },
  {
    accessorKey: 'cuenta_email',
    header: 'Email Cuenta',
    enableSorting: false,
    cell: ({ row }) => {
      const email = row.original.stock_productos?.email
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='truncate text-sm'>
              {email?.slice(0, 20) || 'N/A'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{email || 'N/A'}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
    filterFn: (row, _id, value) => {
      const email = row.original.stock_productos?.email || ''
      return email.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'cuenta_clave',
    header: 'Clave',
    enableSorting: false,
    cell: ({ row }) => {
      const clave = row.original.stock_productos?.clave
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='font-mono text-sm'>
              {clave?.slice(0, 20) || 'N/A'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{clave || 'N/A'}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    accessorKey: 'cuenta_url',
    header: 'URL',
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.stock_productos?.url
      return (
        <div>
          {url ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='max-w-32 truncate text-sm text-blue-600 underline hover:text-blue-800'
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
    header: 'Perfil',
    enableSorting: false,
    cell: ({ row }) => {
      const perfil = row.original.stock_productos?.perfil
      return <span className='text-sm'>{perfil || 'N/A'}</span>
    },
  },
  {
    accessorKey: 'pin',
    header: 'PIN',
    enableSorting: false,
    cell: ({ row }) => {
      const pin = row.original.stock_productos?.pin
      return <span className='font-mono text-sm'>{pin || 'N/A'}</span>
    },
  },
  {
    accessorKey: 'fecha_inicio',
    header: 'Inicio',
    enableSorting: false,
    cell: ({ row }) => {
      const fechaInicio = row.original.fecha_inicio
      return (
        <div className='space-y-1'>
          {new Date(fechaInicio as string).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
          })}
          <br />
          <span className='text-muted-foreground text-xs'>
            {new Date(fechaInicio as string).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_fin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fin' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaExpiracion = row.original.fecha_expiracion
      if (fechaExpiracion) {
        const formattedFechaExpiracion = new Intl.DateTimeFormat('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC',
        })
          .format(new Date(fechaExpiracion as string))
          .split('/')
          .join('/')
        return <span>{formattedFechaExpiracion}</span>
      }
    },
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días' />
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <DiasRestantesCell
        fecha_expiracion={row.original.fecha_expiracion as string}
        id={row.original.id}
      />
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
