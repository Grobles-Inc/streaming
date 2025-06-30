import { ColumnDef } from '@tanstack/react-table'
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
import { IconDots, IconCheck, IconX, IconEye } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { MappedRetiro } from '../data/types'

// Función para obtener el badge del estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'aprobado':
      return { 
        variant: 'default' as const, 
        label: 'Aprobado',
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
interface RetirosTableActionsProps {
  retiro: MappedRetiro
  onAprobar: (id: string) => Promise<void>
  onRechazar: (id: string) => Promise<void>
  onVer: (retiro: MappedRetiro) => void | Promise<void>
}

// Componente de acciones
function RetirosTableActions({ retiro, onAprobar, onRechazar, onVer }: RetirosTableActionsProps) {
  const puedeModificar = retiro.estado === 'pendiente'

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
        <DropdownMenuItem onClick={() => onVer(retiro)}>
          <IconEye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        {puedeModificar && (
          <>
            <DropdownMenuItem 
              onClick={() => onAprobar(retiro.id)}
              className="text-green-600 focus:text-green-600"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Aprobar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onRechazar(retiro.id)}
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
export function createRetirosColumns(
  onAprobar: (id: string) => Promise<void>,
  onRechazar: (id: string) => Promise<void>,
  onVer: (retiro: MappedRetiro) => void | Promise<void>
): ColumnDef<MappedRetiro>[] {
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
          <div className="text-right font-mono">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
              monto > 0 
                ? 'bg-red-50 text-red-700 border border-red-200' 
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
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      cell: ({ row }) => {
        const fecha = row.getValue('fechaActualizacion') as Date
        const fechaCreacion = row.getValue('fechaCreacion') as Date
        const esActualizada = fecha.getTime() !== fechaCreacion.getTime()
        
        if (!esActualizada) {
          return <span className="text-sm text-muted-foreground">Sin cambios</span>
        }
        
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
        <RetirosTableActions
          retiro={row.original}
          onAprobar={onAprobar}
          onRechazar={onRechazar}
          onVer={onVer}
        />
      ),
    },
  ]
}
