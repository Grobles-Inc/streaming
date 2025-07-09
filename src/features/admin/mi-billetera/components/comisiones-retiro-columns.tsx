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
  IconWallet,
  IconCalendar
} from '@tabler/icons-react'
import type { ComisionRetiro } from '../data/types'

interface ComisionesRetiroTableActionsProps {
  comision: ComisionRetiro
  onVer: (comision: ComisionRetiro) => void
}

function ComisionesRetiroTableActions({ 
  comision, 
  onVer
}: ComisionesRetiroTableActionsProps) {
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

export const getComisionesRetiroColumns = (
  onVer: (comision: ComisionRetiro) => void
): ColumnDef<ComisionRetiro>[] => [
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
    accessorKey: 'monto_retiro',
    header: 'Monto Retiro',
    cell: ({ row }) => {
      const monto = row.original.monto_retiro
      
      return (
        <div className="flex items-center space-x-2">
          <IconWallet className="h-4 w-4 text-muted-foreground" />
          <div className="text-right">
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              ${monto.toFixed(2)}
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
    accessorKey: 'fecha_retiro',
    header: 'Fecha Retiro',
    cell: ({ row }) => {
      const fecha = new Date(row.original.fecha_retiro)
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
    accessorKey: 'retiro_id',
    header: 'ID Retiro',
    cell: ({ row }) => {
      const retiroId = row.original.retiro_id
      return (
        <Badge variant="outline" className="font-mono text-xs">
          #{retiroId}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => (
      <ComisionesRetiroTableActions 
        comision={row.original} 
        onVer={onVer}
      />
    ),
    enableSorting: false,
  },
]
