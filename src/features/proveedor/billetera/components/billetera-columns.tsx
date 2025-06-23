import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import type { Transaccion } from '../data/schema'

export const columns: ColumnDef<Transaccion>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id_usuario',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID Usuario" />
    ),
    cell: ({ row }) => <div className="w-[100px]">{row.getValue('id_usuario')}</div>,
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string
      const estadoMap = {
        completado: { label: 'Completado', variant: 'default' as const },
        pendiente: { label: 'Pendiente', variant: 'secondary' as const },
        fallido: { label: 'Fallido', variant: 'destructive' as const },
        cancelado: { label: 'Cancelado', variant: 'outline' as const },
      }
      const estadoInfo = estadoMap[estado as keyof typeof estadoMap]
      
      return (
        <Badge variant={estadoInfo.variant}>
          {estadoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'tx_fecha',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha TX" />
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('tx_fecha'))
      return (
        <div className="w-[140px]">
          {fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })} {fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'articulos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Artículos" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate">{row.getValue('articulos')}</div>
    ),
  },
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      const tipoMap = {
        recarga: { label: 'Recarga', variant: 'default' as const },
        retiro: { label: 'Retiro', variant: 'secondary' as const },
        compra: { label: 'Compra', variant: 'outline' as const },
        venta: { label: 'Venta', variant: 'default' as const },
        comision: { label: 'Comisión', variant: 'secondary' as const },
      }
      const tipoInfo = tipoMap[tipo as keyof typeof tipoMap]
      
      return (
        <Badge variant={tipoInfo.variant}>
          {tipoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue('total') as number
      const formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(total)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: 'cambio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cambio" />
    ),
    cell: ({ row }) => {
      const cambio = row.getValue('cambio') as number
      const formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(cambio)
      const isPositive = cambio > 0
      return (
        <div className={`text-right font-medium ${isPositive ? 'text-green-600' : cambio < 0 ? 'text-red-600' : ''}`}>
          {cambio > 0 ? '+' : ''}{formatted}
        </div>
      )
    },
  },
  {
    accessorKey: 'saldo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Saldo" />
    ),
    cell: ({ row }) => {
      const saldo = row.getValue('saldo') as number
      const formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(saldo)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 