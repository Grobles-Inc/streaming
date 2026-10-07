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

// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

// Evita disparar la actualización más de una vez por pedido durante la sesión
const updatedVencidoIds = new Set<number>()

// Componente para pintar los días restantes calculados por el servidor y
// marcar automáticamente como "vencido" cuando ya no quedan días.
const DiasRestantesCell = ({
  diasRestantes,
  id,
}: {
  diasRestantes: number | null
  id: number
}) => {
  const { mutate: updatePedidoStatusVencido } = useUpdatePedidoStatusVencido()

  useEffect(() => {
    if (
      diasRestantes !== null &&
      diasRestantes <= 0 &&
      !updatedVencidoIds.has(id)
    ) {
      updatedVencidoIds.add(id)
      updatePedidoStatusVencido(id)
    }
  }, [diasRestantes, id, updatePedidoStatusVencido])

  let badgeColor = 'bg-gray-500 text-white dark:text-white border-gray-500'
  if (diasRestantes !== null && diasRestantes > 0) {
    if (diasRestantes < 10) {
      badgeColor = 'bg-orange-400 text-white dark:text-white border-orange-500'
    } else if (diasRestantes < 30) {
      badgeColor = 'bg-green-500 text-white dark:text-white border-green-500'
    } else {
      badgeColor = ''
    }
  } else if (diasRestantes !== null) {
    badgeColor = 'bg-red-500 text-white dark:text-white border-red-500'
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
  },
  {
    accessorKey: 'producto_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => (
      <span className='truncate'>
        {row.original.producto_nombre || 'Sin producto'}
      </span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'estado_calculado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estadoCalculado = row.original.estado_calculado as PedidoEstado
      const badgeColor = estadosMap.get(estadoCalculado)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor)}>
          {estadoCalculado}
        </Badge>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'vendedor_usuario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendedor' />
    ),
    cell: ({ row }) => (
      <span className='truncate'>
        {row.original.vendedor_usuario || 'Sin Vendedor'}
      </span>
    ),
  },
  {
    accessorKey: 'vendedor_telefono',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => {
      const telefono = row.original.vendedor_telefono

      if (!telefono) {
        return <span className='text-gray-400'>Sin teléfono</span>
      }

      return (
        <button
          className='flex flex-col items-center hover:opacity-60'
          onClick={() => abrirWhatsApp(telefono)}
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    cell: ({ row }) => (
      <span>$ {row.original.precio.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: 'producto_precio_renovacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='P. Renovación' />
    ),
    cell: ({ row }) => {
      const precioRenovacion = row.original.producto_precio_renovacion
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email Cuenta' />
    ),
    cell: ({ row }) => {
      const email = row.original.cuenta_email
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
  },
  {
    accessorKey: 'cuenta_clave',
    header: 'Clave',
    enableSorting: false,
    cell: ({ row }) => {
      const clave = row.original.cuenta_clave
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
      const url = row.original.cuenta_url
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
    accessorKey: 'cuenta_perfil',
    header: 'Perfil',
    enableSorting: false,
    cell: ({ row }) => (
      <span className='text-sm'>{row.original.cuenta_perfil || 'N/A'}</span>
    ),
  },
  {
    accessorKey: 'cuenta_pin',
    header: 'PIN',
    enableSorting: false,
    cell: ({ row }) => (
      <span className='font-mono text-sm'>
        {row.original.cuenta_pin || 'N/A'}
      </span>
    ),
  },
  {
    accessorKey: 'fecha_inicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Inicio' />
    ),
    cell: ({ row }) => {
      const fechaInicio = row.original.fecha_inicio

      if (!fechaInicio) {
        return <span className='text-muted-foreground text-xs'>N/A</span>
      }

      return (
        <div className='space-y-1'>
          {new Date(fechaInicio).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC',
          })}
          <br />
          <span className='text-muted-foreground text-xs'>
            {new Date(fechaInicio).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_expiracion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fin' />
    ),
    cell: ({ row }) => {
      const fechaExpiracion = row.original.fecha_expiracion

      if (!fechaExpiracion) {
        return <span className='text-muted-foreground text-xs'>N/A</span>
      }

      const formattedFechaExpiracion = new Intl.DateTimeFormat('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(fechaExpiracion))
      return <span>{formattedFechaExpiracion}</span>
    },
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días' />
    ),
    cell: ({ row }) => (
      <DiasRestantesCell
        diasRestantes={row.original.dias_restantes}
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
