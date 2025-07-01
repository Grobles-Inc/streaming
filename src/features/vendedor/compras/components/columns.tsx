import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CompraMessage, SoporteMessage } from '@/lib/whatsapp'
import { IconHeadphones, IconLoader2, IconPackage, IconRefresh } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useCompras } from '../context/compras-context'
import { estadosMap, productoOpciones } from '../data/data'
import { Compra, CompraEstado, compraSchema } from '../data/schema'
import { useRenovarCompra, useUpdateCompraStatusVencido } from '../queries'
import { DataTableColumnHeader } from './data-table-column-header'

const DiasRestantesCell = ({ fecha_expiracion, id }: { fecha_expiracion: string, id: string }) => {
  const { isPending } = useRenovarCompra()
  const { mutate: updateCompraStatus } = useUpdateCompraStatusVencido()
  const fecha_expiracion_date = new Date(fecha_expiracion)
  const fecha_actual = new Date()
  const dias_restantes = Math.ceil((fecha_expiracion_date.getTime() - fecha_actual.getTime()) / (1000 * 60 * 60 * 24))

  useEffect(() => {
    if (dias_restantes === 0) {
      updateCompraStatus(id)
    }
  }, [dias_restantes, id, updateCompraStatus])

  let badgeColor = ''
  if (dias_restantes < 5) {
    badgeColor = 'bg-red-500 text-white dark:text-white border-red-500'
  } else if (dias_restantes < 10) {
    badgeColor = 'bg-orange-400 text-white dark:text-white border-orange-500'
  } else if (dias_restantes < 30) {
    badgeColor = 'bg-green-500 text-white dark:text-white border-green-500'
  }
  return (
    <div className='flex justify-center'>
      <Badge className={cn('capitalize h-7 w-7 rounded-full', badgeColor)}>
        {isPending ? <IconLoader2 className='animate-spin' size={16} /> : dias_restantes}
      </Badge>
    </div>
  )
}

const PasswordCell = ({ value }: { value: string }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className='flex space-x-2'>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem] cursor-pointer'
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? value : '●●●●●●'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isVisible ? 'Ocultar' : 'Mostrar'} la clave</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

const CompraMessageCell = ({ row }: { row: Compra }) => {
  const isMobile = useIsMobile()
  const handleClick = () => {
    CompraMessage({
      producto_nombre: row.productos?.nombre || '',
      producto_precio: row.monto_reembolso,
      email_cuenta: row.stock_productos?.email || '',
      clave_cuenta: row.stock_productos?.clave || '',
      perfil: row.stock_productos?.perfil || '',
      pin: row.stock_productos?.pin || '',
      fecha_inicio: row.fecha_inicio,
      fecha_expiracion: row.fecha_expiracion,
      ciclo_facturacion: '30 días',
    }, '51914019629', isMobile ? 'mobile' : 'web')
  }
  return (
    <Button variant="ghost" className='flex flex-col items-center gap-0 ' onClick={handleClick}>
      <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
      <span className='text-green-500 text-[9px]'>
        {row.telefono_cliente}
      </span>
    </Button>
  )
}

const SoporteCell = ({ row }: { row: Compra }) => {
  const { setOpen, setCurrentRow } = useCompras()
  const isMobile = useIsMobile()
  return (
    <div className='flex justify-center'>
      {
        row.estado === 'soporte' ? (
          <Button variant='ghost' size='icon' className='flex flex-col items-center gap-0' onClick={() => {
            SoporteMessage({
              nombre_cliente: row.nombre_cliente,
              asunto: 'Soporte',
              mensaje: 'Necesito soporte con el siguiente producto:',
              id_cliente: row.id || '',
              id_producto: row.producto_id,
            }, row.usuarios?.telefono || '', isMobile ? 'mobile' : 'web')
          }}>
            <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
            <span className='text-green-500 text-[9px]'>
              {row.usuarios?.telefono}
            </span>
          </Button>
        ) : (
          <Button variant='outline' size='icon' onClick={() => {
            setOpen('soporte')
            setCurrentRow(row)
          }}>
            <IconHeadphones color='purple' />
          </Button>
        )
      }
    </div>
  )
}

const RenovacionCell = ({ row }: { row: Compra }) => {
  const { mutate: renovarCompra, isPending } = useRenovarCompra()
  const handleClick = () => {
    if (row.id) {
      renovarCompra({ id: row.id, tiempo_uso: row.productos?.tiempo_uso || 0, fecha_expiracion: row.fecha_expiracion })
    }
  }
  return (
    <div className='flex justify-center'>
      <Button variant="secondary" size='icon' onClick={handleClick} disabled={isPending}>
        <IconRefresh className={`${isPending ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}

const ProductoCell = ({ row }: { row: Compra }) => {
  const { setOpen, setCurrentRow } = useCompras()
  const handleClick = () => {
    setOpen('ver_producto')
    setCurrentRow(compraSchema.parse(row))
  }
  return <div className='flex justify-center'>
    <Button variant="secondary" size='icon' onClick={handleClick}>
      <IconPackage color='purple' />
    </Button>
  </div>
}


export const columns: ColumnDef<Compra>[] = [

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
      const idValue = row.getValue('id');
      return <div className='w-[80px]'>C-{typeof idValue === 'string' ? idValue.slice(0, 4) : ''}</div>;
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
      const productoNombre = (row.original as any)?.productos?.nombre
      const label = productoOpciones.find((label) => label.value === productoNombre)

      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem]'>
            {productoNombre}
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
    accessorKey: 'email_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const { stock_productos } = row.original
      return <div className='flex justify-center'>{stock_productos?.email}</div>
    },
    enableSorting: false,

  },

  {
    accessorKey: 'clave_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    cell: ({ row }) => {
      const { stock_productos } = row.original
      return <PasswordCell value={stock_productos?.clave || ''} />
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
      const badgeColor = estadosMap.get(estado as CompraEstado)
      return (
        <div className='flex space-x-2'>
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
    accessorKey: 'perfil_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { stock_productos } = row.original
      return <div className='flex justify-center'>{stock_productos?.perfil}</div>
    },
  },
  {
    accessorKey: 'pin_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { stock_productos } = row.original
      return <div className='flex justify-center'>{stock_productos?.pin}</div>
    },
  },
  {
    id: 'ver_producto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      return <ProductoCell row={row.original} />
    },
  },
  {
    accessorKey: 'nombre_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'telefono_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    cell: ({ row }) => <CompraMessageCell row={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: 'monto_reembolso',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reembolso' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { monto_reembolso } = row.original
      return (
        <div className='flex justify-center'>
          <span>$ {(monto_reembolso as number).toFixed(2)}</span>
        </div>
      )
    },
  },

  {
    accessorKey: 'proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) => {
      const { usuarios } = row.original
      return <div className='flex justify-center'>{usuarios?.nombres}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'fecha_expiracion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días restantes' />
    ),
    cell: ({ row }) => {
      return <DiasRestantesCell fecha_expiracion={row.original.fecha_expiracion as string} id={row.original.id as string} />
    },
    enableSorting: false,
  },
  {
    id: 'comunicacion_proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) => {
      return (
        <SoporteCell row={row.original} />
      )
    },
  },
  {
    id: 'renovar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Renovar' />
    ),
    cell: ({ row }) => {
      return <RenovacionCell row={row.original} />
    },
  }
]
