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
        <div className="text-left font-medium text-green-600">
          +{formatted}
        </div>
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
        completado: { 
          label: 'Aprobado', 
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
        },
        pendiente: { 
          label: 'Pendiente', 
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300'
        },
        fallido: { 
          label: 'Rechazado', 
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
        },
      }
      const estadoInfo = estadoMap[estado as keyof typeof estadoMap] || { 
        label: estado, 
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
      }
      
      return (
        <Badge variant={estadoInfo.variant} className={estadoInfo.className}>
          {estadoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
] 