import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { CompraMessage } from '@/lib/whatsapp'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { estadosMap, productoOpciones } from '../data/data'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Compra, CompraEstado } from '../data/schema'
import { IconHeadphones } from '@tabler/icons-react'
import { ComprasSoporteModal } from './compras-soporte-modal'

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

const SoporteMessageCell = ({ row }: { row: Compra }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="secondary" className='flex items-center gap-1' onClick={() => setOpen(true)}>
        <IconHeadphones />
      </Button>
      <ComprasSoporteModal open={open} setOpen={setOpen} currentRow={row} telefono={row.usuarios?.telefono || ''} />
    </>
  )
}

const CompraMessageCell = ({ row }: { row: Compra }) => {
  const isMobile = useIsMobile()
  const handleClick = () => {
    CompraMessage({
      producto_nombre: row.productos?.nombre || '',
      producto_precio: row.monto_reembolso,
      email_cuenta: row.email_cuenta,
      clave_cuenta: row.clave_cuenta,
      url_cuenta: row.productos?.url_cuenta || '',
      perfil: row.perfil_cuenta,
      pin: row.pin_cuenta,
      fecha_inicio: row.fecha_inicio,
      fecha_termino: row.fecha_termino,
      ciclo_facturacion: '30 días',
    }, '51914019629', isMobile ? 'mobile' : 'web')
  }
  return (
    <Button variant="ghost" className='flex items-center gap-1' onClick={handleClick}>
      <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
      <span className='text-green-500'>
        {row.telefono_cliente.slice(2)}
      </span>
    </Button>
  )
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
      // Ensure idValue is a string before calling slice
      return <div className='w-[80px]'>{typeof idValue === 'string' ? idValue.slice(0, 4) : ''}</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'productos', // This matches the joined property from your query
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      // Try to access the product name from the joined productos object, fallback to producto_id if not present
      const productoNombre = (row.original as any)?.productos?.nombre || row.original.producto_id
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
    enableHiding: false,
  },
  {
    accessorKey: 'email_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    enableSorting: false,

  },

  {
    accessorKey: 'clave_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    cell: ({ row }) => <PasswordCell value={row.getValue('clave_cuenta')} />,
    enableSorting: false,
  },

  {
    accessorKey: 'productos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { productos } = row.original
      return <div className='flex justify-center'>{productos?.url_cuenta}</div>
    },
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
  },
  {
    accessorKey: 'pin_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    enableSorting: false,
  }, {
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
      <DataTableColumnHeader column={column} title='Monto de reembolso' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const { monto_reembolso } = row.original
      return (
        <div className='flex justify-center'>
          <span>$ {monto_reembolso}</span>
        </div>
      )
    },
  },

  {
    accessorKey: 'usuarios',
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
    accessorKey: 'usuarios',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) =>
      <SoporteMessageCell row={row.original as Compra & { usuarios: { telefono: string } }} />,
    enableSorting: false,
  },
  {
    accessorKey: 'fecha_termino',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días restantes' />
    ),
    cell: ({ row }) => {
      const fecha_termino = new Date(row.getValue('fecha_termino') as string)
      const fecha_actual = new Date()
      const dias_restantes = Math.ceil((fecha_termino.getTime() - fecha_actual.getTime()) / (1000 * 60 * 60 * 24))
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
            {dias_restantes}
          </Badge>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'opciones',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Opciones' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
