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
  IconWallet,
  IconCalendar
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { ComisionGeneral } from '../data/types'

function getTipoBadge(tipo: 'publicacion' | 'retiro') {
  switch (tipo) {
    case 'publicacion':
      return {
        variant: 'default' as const,
        label: 'Publicación',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: IconPackage
      }
    case 'retiro':
      return {
        variant: 'secondary' as const,
        label: 'Retiro',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: IconWallet
      }
  }
}

interface ComisionesGeneralesTableActionsProps {
  comision: ComisionGeneral
  onVer: (comision: ComisionGeneral) => void
}

function ComisionesGeneralesTableActions({ 
  comision, 
  onVer
}: ComisionesGeneralesTableActionsProps) {
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

export const getComisionesGeneralesColumns = (
  onVer: (comision: ComisionGeneral) => void
): ColumnDef<ComisionGeneral>[] => [
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
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipo = row.original.tipo
      const tipoBadge = getTipoBadge(tipo)
      const Icon = tipoBadge.icon
      
      return (
        <Badge 
          variant={tipoBadge.variant}
          className={cn('flex items-center gap-1', tipoBadge.className)}
        >
          <Icon className="h-3 w-3" />
          {tipoBadge.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'usuario',
    header: 'Usuario',
    cell: ({ row }) => {
      const usuario = row.original.usuario
      const iniciales = `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`
      
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {iniciales.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-foreground truncate">
              {usuario.nombres} {usuario.apellidos}
            </p>
            <p className="text-xs text-muted-foreground">
              @{usuario.usuario}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) => {
      const descripcion = row.original.descripcion
      const producto = row.original.producto
      
      return (
        <div className="max-w-xs">
          <p className="text-sm text-foreground truncate">
            {descripcion}
          </p>
          {producto && (
            <p className="text-xs text-muted-foreground truncate">
              {producto.nombre}
            </p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'monto_base',
    header: 'Monto Base',
    cell: ({ row }) => {
      const monto = row.original.monto_base
      
      return (
        <div className="text-right">
          <p className="font-medium text-sm">
            ${monto.toFixed(2)}
          </p>
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
    accessorKey: 'fecha_transaccion',
    header: 'Fecha',
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha_transaccion)
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
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ComisionesGeneralesTableActions 
        comision={row.original} 
        onVer={onVer}
      />
    ),
    enableSorting: false,
  },
]
