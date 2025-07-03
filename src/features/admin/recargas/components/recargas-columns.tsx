import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { IconCheck, IconDots, IconEye, IconX } from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import type { MappedRecarga } from '../data/types'

// Función para obtener el badge del estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'aprobado':
    case 'completado':
      return {
        variant: 'default' as const,
        label: estado === 'completado' ? 'Completado' : 'Aprobado',
        className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
      }
    case 'pendiente':
      return {
        variant: 'secondary' as const,
        label: 'Pendiente',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
      }
    case 'rechazado':
      return {
        variant: 'destructive' as const,
        label: 'Rechazado',
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
      }
    default:
      return {
        variant: 'outline' as const,
        label: estado,
        className: ''
      }
  }
}

// Props para las acciones
interface RecargasTableActionsProps {
  recarga: MappedRecarga
  onAprobar: (id: string) => Promise<void>
  onRechazar: (id: string) => Promise<void>
  onVer: (recarga: MappedRecarga) => void | Promise<void>
}

// Componente de acciones
function RecargasTableActions({ recarga, onAprobar, onRechazar, onVer }: RecargasTableActionsProps) {
  const puedeModificar = recarga.estado === 'pendiente'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <IconDots className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onVer(recarga)}>
          <IconEye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        {puedeModificar && (
          <>
            <DropdownMenuItem
              onClick={() => onAprobar(recarga.id)}
              className="text-green-600 focus:text-green-600"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Aprobar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRechazar(recarga.id)}
              className="text-red-600 focus:text-red-600"
            >
              <IconX className="mr-2 h-4 w-4" />
              Rechazar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Definir las columnas
export function createRecargasColumns(
  onAprobar: (id: string) => Promise<void>,
  onRechazar: (id: string) => Promise<void>,
  onVer: (recarga: MappedRecarga) => void | Promise<void>
): ColumnDef<MappedRecarga>[] {
  return [
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
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'usuarioNombre',
      header: 'Usuario',
      cell: ({ row }) => {
        const nombre = row.getValue('usuarioNombre') as string
        const telefono = row.original.usuarioTelefono
        return (
          <div className="space-y-1">
            <div className="font-medium">{nombre}</div>
            {telefono && (
              <div className="text-sm text-muted-foreground">{telefono}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'montoFormateado',
      header: 'Monto',
      cell: ({ row }) => {
        const monto = row.original.monto
        const montoFormateado = row.getValue('montoFormateado') as string
        return (
          <div className="text-right">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
              monto > 0
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200'
            )}>
              {montoFormateado}
            </span>
          </div>
        )
      },
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string
        const badge = getEstadoBadge(estado)
        return (
          <Badge variant={badge.variant} className={badge.className}>
            {badge.label}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha de Solicitud',
      cell: ({ row }) => {
        const fecha = row.getValue('fechaCreacion') as Date
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {fecha.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              {fecha.toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )
      },
    },

    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <RecargasTableActions
          recarga={row.original}
          onAprobar={onAprobar}
          onRechazar={onRechazar}
          onVer={onVer}
        />
      ),
    },
  ]
}
