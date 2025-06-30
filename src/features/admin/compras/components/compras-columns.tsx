import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  IconDots, 
  IconCheck, 
  IconX, 
  IconEye, 
  IconClock,
  IconCurrencyDollar
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { MappedCompra } from '../data/types'

// Función para obtener el badge del estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'entregado':
      return { 
        variant: 'default' as const, 
        label: 'Entregado',
        className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        icon: IconCheck
      }
    case 'cancelado':
      return { 
        variant: 'destructive' as const, 
        label: 'Cancelado',
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        icon: IconX
      }
    case 'en_proceso':
      return { 
        variant: 'secondary' as const, 
        label: 'En Proceso',
        className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        icon: IconClock
      }
    case 'reembolsado':
      return { 
        variant: 'outline' as const, 
        label: 'Reembolsado',
        className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
        icon: IconCurrencyDollar
      }
    case 'pendiente':
      return { 
        variant: 'secondary' as const, 
        label: 'Pendiente',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
        icon: IconClock
      }
    default:
      return { 
        variant: 'outline' as const, 
        label: estado,
        className: '',
        icon: IconClock
      }
  }
}

// Props para las acciones
interface ComprasTableActionsProps {
  compra: MappedCompra
  onMarcarEntregado: (id: string) => Promise<void>
  onMarcarCancelado: (id: string) => Promise<void>
  onMarcarEnProceso: (id: string) => Promise<void>
  onProcesarReembolso: (id: string) => Promise<void>
  onVer: (compra: MappedCompra) => void | Promise<void>
}

// Componente de acciones
function ComprasTableActions({ 
  compra, 
  onMarcarEntregado, 
  onMarcarCancelado, 
  onMarcarEnProceso, 
  onProcesarReembolso, 
  onVer 
}: ComprasTableActionsProps) {
  const puedeModificar = compra.puedeModificar
  const puedeReembolsar = compra.requiereReembolso || ['pendiente', 'en_proceso'].includes(compra.estado)

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
        <DropdownMenuItem onClick={() => onVer(compra)}>
          <IconEye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        
        {puedeModificar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onMarcarEntregado(compra.id)}
              className="text-green-600 focus:text-green-600"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Marcar como entregado
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onMarcarCancelado(compra.id)}
              className="text-red-600 focus:text-red-600"
            >
              <IconX className="mr-2 h-4 w-4" />
              Marcar como cancelado
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onMarcarEnProceso(compra.id)}
              className="text-blue-600 focus:text-blue-600"
            >
              <IconClock className="mr-2 h-4 w-4" />
              Marcar en proceso
            </DropdownMenuItem>
          </>
        )}
        
        {puedeReembolsar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onProcesarReembolso(compra.id)}
              className="text-purple-600 focus:text-purple-600"
            >
              <IconCurrencyDollar className="mr-2 h-4 w-4" />
              Procesar reembolso
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Definir las columnas
export function createComprasColumns(
  onMarcarEntregado: (id: string) => Promise<void>,
  onMarcarCancelado: (id: string) => Promise<void>,
  onMarcarEnProceso: (id: string) => Promise<void>,
  onProcesarReembolso: (id: string) => Promise<void>,
  onVer: (compra: MappedCompra) => void | Promise<void>
): ColumnDef<MappedCompra>[] {
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
      accessorKey: 'nombreCliente',
      header: 'Cliente',
      cell: ({ row }) => {
        const nombre = row.getValue('nombreCliente') as string
        const telefono = row.original.telefonoCliente
        const vendedor = row.original.vendedorNombre
        return (
          <div className="space-y-1">
            <div className="font-medium">{nombre}</div>
            <div className="text-xs text-muted-foreground">{telefono}</div>
            <div className="text-xs text-blue-600">Vendedor: {vendedor}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'productoNombre',
      header: 'Producto',
      cell: ({ row }) => {
        const producto = row.getValue('productoNombre') as string
        const proveedor = row.original.proveedorNombre
        return (
          <div className="space-y-1">
            <div className="font-medium">{producto}</div>
            <div className="text-xs text-muted-foreground">por {proveedor}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'precioFormateado',
      header: 'Precio',
      cell: ({ row }) => {
        const precioFormateado = row.getValue('precioFormateado') as string
        return (
          <div className="text-right font-mono">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
              'bg-green-50 text-green-700 border border-green-200'
            )}>
              {precioFormateado}
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
        const Icon = badge.icon
        return (
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant} className={badge.className}>
              <Icon className="mr-1 h-3 w-3" />
              {badge.label}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'fechaCreacion',
      header: 'Fecha Creación',
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
      accessorKey: 'montoReembolsoFormateado',
      header: 'Reembolso',
      cell: ({ row }) => {
        const monto = row.original.montoReembolso
        const montoFormateado = row.getValue('montoReembolsoFormateado') as string
        
        if (monto <= 0) {
          return <span className="text-xs text-muted-foreground">No aplica</span>
        }
        
        return (
          <div className="text-right font-mono">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
              'bg-purple-50 text-purple-700 border border-purple-200'
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
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ComprasTableActions
          compra={row.original}
          onMarcarEntregado={onMarcarEntregado}
          onMarcarCancelado={onMarcarCancelado}
          onMarcarEnProceso={onMarcarEnProceso}
          onProcesarReembolso={onProcesarReembolso}
          onVer={onVer}
        />
      ),
    },
  ]
}
