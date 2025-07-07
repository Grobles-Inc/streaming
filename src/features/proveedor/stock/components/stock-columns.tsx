import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { IconEdit, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row'] & {
  producto?: {
    id: string
    nombre: string
  }
}

interface StockColumnActions {
  onEdit: (stock: StockProducto) => void
  onDelete: (stock: StockProducto) => void
  onTogglePublicado: (stock: StockProducto) => void
  isUpdating: boolean
}

export const createStockColumns = (
  actions: StockColumnActions
): ColumnDef<StockProducto>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'numero',
    header: 'ID',
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex
      const pageSize = table.getState().pagination.pageSize
      const rowIndex = row.index
      const numero = pageIndex * pageSize + rowIndex + 1
      
      return (
        <div className="font-mono text-sm">
          {numero}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'producto',
    header: 'Producto',
    cell: ({ row }) => {
      const producto = row.getValue('producto') as StockProducto['producto']
      return (
        <div className="max-w-40">
          <div className="truncate font-medium" title={producto?.nombre || 'N/A'}>
            {producto?.nombre || 'N/A'}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      const colors = {
        'cuenta': 'bg-blue-50 text-blue-700 border-blue-200',
        'perfiles': 'bg-purple-50 text-purple-700 border-purple-200',
        'combo': 'bg-orange-50 text-orange-700 border-orange-200',
      }

      return (
        <Badge variant="outline" className={cn('text-xs', colors[tipo as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
          {tipo === 'cuenta' ? 'Cuenta' : tipo === 'perfiles' ? 'Perfiles' : 'Combo'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="max-w-32">
        <div className="truncate" title={row.getValue('email') || 'N/A'}>
          {row.getValue('email') || 'N/A'}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'clave',
    header: 'Clave',
    cell: ({ row }) => (
      <div className="max-w-24">
        <div className="truncate font-mono text-sm" title={row.getValue('clave') || 'N/A'}>
          {row.getValue('clave') || 'N/A'}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'pin',
    header: 'PIN',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('pin') || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: 'perfil',
    header: 'Perfil',
    cell: ({ row }) => (
      <div className="max-w-24">
        <div className="truncate" title={row.getValue('perfil') || 'N/A'}>
          {row.getValue('perfil') || 'N/A'}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      const url = row.getValue('url') as string
      return (
        <div className="max-w-32">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm truncate block"
              title={url}
            >
              Enlace
            </a>
          ) : (
            'N/A'
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'estado',
    header: 'Estado',
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string
      const colors = {
        'disponible': 'bg-green-50 text-green-700 border-green-200',
        'vendido': 'bg-red-50 text-red-700 border-red-200',
      }

      return (
        <Badge variant="outline" className={cn('text-xs', colors[estado as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
          {estado === 'disponible' ? 'Disponible' : 'Vendido'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'soporte_stock_producto',
    header: 'Soporte',
    cell: ({ row }) => {
      const soporte = row.getValue('soporte_stock_producto') as string
      const colors = {
        'activo': 'bg-green-50 text-green-700 border-green-200',
        'vencido': 'bg-red-50 text-red-700 border-red-200',
        'soporte': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      }

      return (
        <Badge variant="outline" className={cn('text-xs', colors[soporte as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
          {soporte === 'activo' ? 'Activo' : soporte === 'vencido' ? 'Vencido' : 'Soporte'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'publicado',
    header: 'Publicado',
    cell: ({ row }) => {
      const stock = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => actions.onTogglePublicado(stock)}
          disabled={actions.isUpdating}
        >
          {stock.publicado ? (
            <IconEye size={16} className="text-green-600" />
          ) : (
            <IconEyeOff size={16} className="text-gray-400" />
          )}
        </Button>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.getValue('created_at')).toLocaleDateString('es-ES')}
      </div>
    ),
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const stock = row.original
      
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => actions.onEdit(stock)}
          >
            <IconEdit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            onClick={() => actions.onDelete(stock)}
          >
            <IconTrash size={14} />
          </Button>
        </div>
      )
    },
  },
] 