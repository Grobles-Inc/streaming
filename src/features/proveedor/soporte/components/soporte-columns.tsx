import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { IconHeadphones, IconMessage } from '@tabler/icons-react'
import { DataTableColumnHeader } from './data-table-column-header'
import { SoporteCompra, SoporteEstado } from '../soporte-page'

// Mapeo de estados de soporte
const estadoSoporteMap = {
  activo: {
    label: 'Cuenta Sin Problemas',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300'
  },
  soporte: {
    label: 'Problemas con Cuenta',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
  },
  resuelto: {
    label: 'Problemas Resueltos',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300'
  }
}

// Mapeo de asuntos de soporte
const asuntoMap: Record<string, string> = {
  correo: 'Correo',
  clave: 'Clave',
  pago: 'Pago',
  reembolso: 'Reembolso',
  geo: 'Geolocalización',
  codigo: 'Código',
  otros: 'Otros'
}



export const columns = (
  onResponderSoporte: (compra: SoporteCompra) => void
): ColumnDef<SoporteCompra>[] => [
  {
    accessorKey: 'productos.nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Producto" />
    ),
    cell: ({ row }) => {
      const producto = row.original.productos
      return (
        <div className="max-w-[200px]">
          <div className="font-medium">{producto?.nombre || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">
            ${producto?.precio_publico || 0}
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'usuarios',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      return (
        <div>
          <div className="font-medium">
            {usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Sin vendedor'}
          </div>
          {usuario?.telefono && (
            <div className="text-xs text-muted-foreground">{usuario.telefono}</div>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'soporte_asunto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Asunto" />
    ),
    cell: ({ row }) => {
      const asunto = row.getValue('soporte_asunto') as string | null
      return (
        <div>
          {asunto ? (
            <Badge variant="outline">
              {asuntoMap[asunto] || asunto}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Sin asunto</span>
          )}
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      return value.includes(row.getValue('soporte_asunto'))
    },
  },
  {
    accessorKey: 'soporte_mensaje',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mensaje" />
    ),
    cell: ({ row }) => {
      const mensaje = row.getValue('soporte_mensaje') as string | null
      return (
        <div className="max-w-[300px]">
          {mensaje ? (
            mensaje.length <= 60 ? (
              <span>{mensaje}</span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {mensaje.substring(0, 60)}...
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs whitespace-pre-wrap">{mensaje}</p>
                </TooltipContent>
              </Tooltip>
            )
          ) : (
            <span className="text-muted-foreground">Sin mensaje</span>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'stock_productos.soporte_stock_producto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.original.stock_productos?.soporte_stock_producto as SoporteEstado
      const estadoInfo = estadoSoporteMap[estado] || {
        label: estado,
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800'
      }

      return (
        <Badge variant={estadoInfo.variant} className={estadoInfo.className}>
          {estadoInfo.label}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => {
      const estado = row.original.stock_productos?.soporte_stock_producto
      return value.includes(estado)
    },
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => {
      const precio = row.getValue('precio') as number
      return (
        <div className="text-left font-mono">
          <span className="font-medium text-green-600">
            ${precio.toFixed(2)}
          </span>
        </div>
      )
    },
    meta: {
      className: 'text-right',
    },
  },
  {
    id: 'acciones',
    header: 'Acciones',
    cell: ({ row }) => {
      const compra = row.original
      return (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResponderSoporte(compra)}
                className="h-8 w-8 p-0"
              >
                <IconHeadphones className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Gestionar soporte
            </TooltipContent>
          </Tooltip>

          {compra.usuarios?.telefono && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 w-8 p-0"
                >
                  <a
                    href={`https://wa.me/${compra.usuarios.telefono.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconMessage className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Contactar por WhatsApp
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
] 