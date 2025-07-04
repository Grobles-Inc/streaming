import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  IconDots, 
  IconEye, 
  IconPackage,
  IconCalendar
} from '@tabler/icons-react'
import type { ComisionPublicacion } from '../data/types'

interface ComisionesPublicacionTableActionsProps {
  comision: ComisionPublicacion
  onVer: (comision: ComisionPublicacion) => void
}

function ComisionesPublicacionTableActions({ 
  comision, 
  onVer
}: ComisionesPublicacionTableActionsProps) {
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
        <DropdownMenuItem onClick={() => onVer(comision)}>
          <IconEye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const getComisionesPublicacionColumns = (
  onVer: (comision: ComisionPublicacion) => void
): ColumnDef<ComisionPublicacion>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
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
    accessorKey: 'producto.nombre',
    header: 'Producto',
    cell: ({ row }) => {
      const producto = row.original.producto
      return (
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
            <IconPackage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">
              {producto.nombre}
            </p>
            <p className="text-xs text-muted-foreground">
              ${producto.precio_publico.toFixed(2)}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'proveedor',
    header: 'Proveedor',
    cell: ({ row }) => {
      const proveedor = row.original.proveedor
      const iniciales = `${proveedor.nombres.charAt(0)}${proveedor.apellidos.charAt(0)}`
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {iniciales.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">
              {proveedor.nombres} {proveedor.apellidos}
            </p>
            <p className="text-xs text-muted-foreground">
              @{proveedor.usuario}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'monto_comision',
    header: 'Comisión',
    cell: ({ row }) => {
      const monto = row.original.monto_comision
      const porcentaje = row.original.porcentaje_comision
      
      return (
        <div className="text-right">
          <p className="font-semibold text-green-600 dark:text-green-400">
            ${monto.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {porcentaje}%
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_publicacion',
    header: 'Fecha Publicación',
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha_publicacion)
      return (
        <div className="flex items-center space-x-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {fecha.toLocaleDateString('es-ES')}
            </p>
            <p className="text-xs text-muted-foreground">
              {fecha.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'producto.estado',
    header: 'Estado',
    cell: () => {
      return (
        <Badge 
          variant="default"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
        >
          Publicado
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ComisionesPublicacionTableActions 
        comision={row.original} 
        onVer={onVer}
      />
    ),
    enableSorting: false,
  },
]
