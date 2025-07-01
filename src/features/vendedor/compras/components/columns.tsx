import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PhoneInput } from '@/features/landing/categorias/components/phone-input'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CompraMessage } from '@/lib/whatsapp'
import { IconEdit, IconHeadphones, IconLoader2, IconPackage, IconRefresh } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useCompras } from '../context/compras-context'
import { estadosMap, productoOpciones } from '../data/data'
import { Compra, CompraEstado, compraSchema } from '../data/schema'
import { useRenovarCompra, useUpdateCompra, useUpdateCompraStatusVencido } from '../queries'
import { DataTableColumnHeader } from './data-table-column-header'

const DiasRestantesCell = ({ fecha_expiracion, id }: { fecha_expiracion: string, id: string }) => {
  const { isPending } = useRenovarCompra()
  const { mutate: updateCompraStatus } = useUpdateCompraStatusVencido()
  const fecha_actual = new Date()
  const fecha_expiracion_date = fecha_expiracion ? new Date(fecha_expiracion) : null
  const dias_restantes = fecha_expiracion_date ? Math.ceil((fecha_expiracion_date.getTime() - fecha_actual.getTime()) / (1000 * 60 * 60 * 24)) : null

  useEffect(() => {
    if (dias_restantes === 0) {
      updateCompraStatus(id)
    }
  }, [dias_restantes, id, updateCompraStatus])

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
            {isPending ? <IconLoader2 className='animate-spin' size={16} /> : dias_restantes <= 0 ? '0' : dias_restantes}
          </Badge>
        )
      }

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
  const [isEditing, setIsEditing] = useState(false)
  const [telefono, setTelefono] = useState(row.telefono_cliente)
  const [nombres, setNombres] = useState(row.nombre_cliente)
  const { mutate: updateCompra, isPending } = useUpdateCompra()

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
    }, row.telefono_cliente || '', isMobile ? 'mobile' : 'web')
  }

  const handleUpdate = () => {
    updateCompra({
      id: row.id as string,
      updates: {
        telefono_cliente: telefono,
        nombre_cliente: nombres
      }
    })
    setIsEditing(false)
  }

  return (
    <div className='flex justify-center gap-2'>
      <Button variant="ghost" className='flex flex-col items-center gap-0' onClick={handleClick}>
        <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
        <span className='text-green-500 text-[9px]'>
          {row.telefono_cliente}
        </span>
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogTrigger asChild>
          <Button variant="secondary" title='Editar cliente' size='icon' className='flex flex-col items-center gap-0'>
            <IconEdit size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">

            <Input
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Nuevo nombre"
            />
            <PhoneInput
              value={telefono}
              onChange={(e) => setTelefono(e)}
              placeholder="Nuevo teléfono"
            />

            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? <IconLoader2 className='animate-spin' size={16} /> : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const SoporteCell = ({ row }: { row: Compra }) => {
  const { setOpen, setCurrentRow } = useCompras()
  return (
    <div className='flex justify-center'>
      <Button variant='outline' size='icon' onClick={() => {
        setOpen('soporte')
        setCurrentRow(row)
      }}>
        <IconHeadphones color='purple' />
      </Button>
    </div>
  )
}

const RenovacionCell = ({ row }: { row: Compra }) => {
  const { mutate: renovarCompra, isPending } = useRenovarCompra()
  const handleClick = () => {
    if (row.id && row.fecha_expiracion !== null) {
      renovarCompra({ id: row.id, tiempo_uso: row.productos?.tiempo_uso || 0, fecha_expiracion: row.fecha_expiracion })
    }
  }
  return (
    <div className='flex justify-center'>
      <Button variant="secondary" size='icon' onClick={handleClick} disabled={isPending || row.estado === 'soporte'}>
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
    accessorKey: 'fecha_inicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Inicio' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      return <div className='flex justify-center'>{new Date(row.original.fecha_inicio).toLocaleDateString('es-ES')}</div>
    },
  },
  {
    accessorKey: 'fecha_expiracion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Expiración' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      return <div className='flex justify-center'>{row.original.fecha_expiracion ? new Date(row.original.fecha_expiracion).toLocaleDateString('es-ES') : 'Sin activar'}</div>
    },
  },
  {
    accessorKey: 'nombre_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Cliente' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'telefono_cliente',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono Cliente' />
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
      const precio_por_dia = (row.original.precio || 0) / (row.original.productos?.tiempo_uso || 1)
      const dias_restantes = row.original.fecha_expiracion ? Math.ceil((new Date(row.original.fecha_expiracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
      const monto_reembolso = precio_por_dia * dias_restantes

      return (
        <div className='flex flex-col justify-center'>
          <span>$ {(monto_reembolso <= 0 ? 0 : monto_reembolso).toFixed(2)}</span>
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
    accessorKey: 'dias_restantes',
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
