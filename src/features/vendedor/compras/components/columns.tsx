import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import { diasRestantesMap, estadosMap, productoOpciones } from '../data/data'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { cn } from '@/lib/utils'
import { Compra } from '../data/schema'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { IconHeadphones } from '@tabler/icons-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { CompraMessage } from '@/lib/whatsapp'
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
      <Button variant="ghost" className='flex items-center gap-1' onClick={() => setOpen(true)}>
        <IconHeadphones />
      </Button>
      <ComprasSoporteModal open={open} setOpen={setOpen} currentRow={row} telefono={row.telefono_proveedor} />
    </>
  )
}

const CompraMessageCell = ({ row }: { row: Compra }) => {
  const isMobile = useIsMobile()
  const handleClick = () => {
    CompraMessage({
      producto_nombre: row.producto,
      producto_precio: row.monto_reembolso,
      email_cuenta: row.email_cuenta,
      clave_cuenta: row.clave_cuenta,
      url_cuenta: row.url_cuenta,
      perfil: row.perfil,
      pin: row.pin,
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
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'producto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      const label = productoOpciones.find((label) => label.value === row.original.producto)

      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem]'>
            {row.getValue('producto')}
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
  }, {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      const badgeColor = estadosMap.get(estado)
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
    accessorKey: 'url_cuenta',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'perfil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'pin',
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
    accessorKey: 'proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'telefono_proveedor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Proveedor' />
    ),
    cell: ({ row }) =>
      <SoporteMessageCell row={row.original} />,
    enableSorting: false,
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días restantes' />
    ),
    cell: ({ row }) => {
      const dias_restantes = row.getValue('dias_restantes') as number
      const badgeColor = diasRestantesMap.get(dias_restantes) as string
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
