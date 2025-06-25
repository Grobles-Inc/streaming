import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from './data-table-column-header'

// Tipo basado en la tabla recargas de la base de datos
export type Recarga = {
  id: string
  usuario_id: string
  monto: number
  metodo_pago: string
  estado: string
  created_at: string
  updated_at: string
}

export const columns: ColumnDef<Recarga>[] = [
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('created_at'))
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
    accessorKey: 'monto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const monto = row.getValue('monto') as number
      const formatted = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(monto)
      return (
        <div className="text-right font-medium text-green-600">
          +{formatted}
        </div>
      )
    },
  },
  {
    accessorKey: 'metodo_pago',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Método de Pago" />
    ),
    cell: ({ row }) => {
      const metodo = row.getValue('metodo_pago') as string
      const metodoMap = {
        transferencia: { label: 'Transferencia', variant: 'default' as const },
        efectivo: { label: 'Efectivo', variant: 'secondary' as const },
        pse: { label: 'PSE', variant: 'outline' as const },
      }
      const metodoInfo = metodoMap[metodo as keyof typeof metodoMap] || { label: metodo, variant: 'outline' as const }
      
      return (
        <Badge variant={metodoInfo.variant}>
          {metodoInfo.label}
        </Badge>
      )
    },
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
      const estadoInfo = estadoMap[estado as keyof typeof estadoMap] || { label: estado, variant: 'outline' as const }
      
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
] 