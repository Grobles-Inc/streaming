import { useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { estadosMap } from '../data/data'
import { Pedido, PedidoEstado } from '../data/schema'
import { useUpdatePedidoStatusVencido } from '../queries'
import {
  calcularDiasRestantes,
  calcularFechaExpiracion,
  formatearFechaParaMostrar,
} from '../utils/fecha-utils'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

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

  // Calcular días restantes usando la función de utilidad que maneja correctamente las zonas horarias
  // Solo usa la fecha (año-mes-día), ignorando completamente horas, minutos, segundos y timezone
  let diasRestantes: number | null = null

  if (fecha_expiracion) {
    diasRestantes = calcularDiasRestantes(fecha_expiracion)
  }

  // For tablas grandes/infinite scroll, dispara el update solo una vez por id para evitar loops y race conditions.
  // Usa un Set global para trackear ids ya actualizados en esta sesión.
  const updatedIds =
    (window as any).__diasRestantesUpdatedIds ||
    ((window as any).__diasRestantesUpdatedIds = new Set<number>())

  useEffect(() => {
    if (diasRestantes && diasRestantes < 0 && id && !updatedIds.has(id)) {
      updatedIds.add(id)
      updatePedidoStatusVencido(id as number)
    }
  }, [diasRestantes, id])

  let badgeColor = ''
  if (diasRestantes === null) {
    badgeColor = 'bg-gray-500 text-white dark:text-white border-gray-500'
  } else if (diasRestantes < 0) {
    badgeColor = 'bg-red-500 text-white dark:text-white border-red-500'
  } else if (diasRestantes === 0 || diasRestantes < 10) {
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string

      return (
        <div className='flex w-[80px] justify-center font-mono text-sm'>
          {id}
        </div>
      )
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
      const productoNombre =
        row.original?.productos?.nombre?.toLowerCase() || ''
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
    accessorKey: 'usuario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendedor' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      return (
        <div className='flex justify-center'>
          {usuario?.usuario || 'Sin Vendedor'}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const usuario = row.original.usuarios
      const nombreUsuario = usuario?.usuario || ''
      return nombreUsuario.includes(value.toLowerCase())
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
        return (
          <div className='flex justify-center text-gray-400'>Sin teléfono</div>
        )
      }

      return (
        <div className='flex w-[100px] justify-center'>
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
            : 'N/A'}
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
          <span className='font-mono text-sm'>{clave || 'N/A'}</span>
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const perfil = row.original.stock_productos?.perfil
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>{perfil || 'N/A'}</span>
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
        <span className='flex items-center justify-center text-center font-mono text-sm'>
          {pin || 'N/A'}
        </span>
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
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>
            <>
              {formatearFechaParaMostrar(fechaInicio as string)}
              <br />
              <span className='text-muted-foreground text-xs'>
                {fechaInicio
                  ? new Date(fechaInicio).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </span>
            </>
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

      // Verificar si es una renovación por vendedor usando la columna renovado

      // Si tiene fecha_expiracion explícita (renovación), usar esa
      if (fechaExpiracion) {
        return (
          <div className='flex justify-center'>
            <span className='text-sm'>
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
          <span className='text-sm'>{formatearFechaParaMostrar(fechaFin)}</span>
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
    cell: ({ row }) => (
      <DiasRestantesCell
        fecha_expiracion={row.original.fecha_expiracion as string}
        id={row.original.id}
      />
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
