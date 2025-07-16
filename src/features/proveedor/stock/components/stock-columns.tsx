import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { IconEdit, IconTrash, IconEye, IconEyeOff, IconDots } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row'] & {
  producto?: {
    id: string
    nombre: string
    estado: string
  }
}

interface StockColumnActions {
  onEdit: (stock: StockProducto) => void
  onDelete: (stock: StockProducto) => void
  onPublicar: (stock: StockProducto) => void
  onDespublicar: (stock: StockProducto) => void
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
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.getValue('id') as number
      
      return (
        <div className="font-mono text-sm">
          {id}
        </div>
      )
    },
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
    accessorKey: 'pin',
    header: 'PIN',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('pin') || 'N/A'}
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
      const publicado = row.getValue('publicado') as boolean
      
      return (
        <Badge 
          variant="outline" 
          className={cn(
            'text-xs',
            publicado 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          )}
        >
          {publicado ? 'Publicado' : 'Sin Publicar'}
        </Badge>
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
      const productoEstaPublicado = stock.producto?.estado === 'publicado'
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <IconDots className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            {stock.publicado ? (
              <DropdownMenuItem onClick={() => actions.onDespublicar(stock)} disabled={actions.isUpdating}>
                <IconEyeOff className="mr-2 h-4 w-4" />
                Despublicar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => actions.onPublicar(stock)} 
                disabled={actions.isUpdating}
                className={!productoEstaPublicado ? 'text-red-500' : ''}
              >
                <IconEye className="mr-2 h-4 w-4" />
                Publicar {!productoEstaPublicado}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(stock)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => actions.onDelete(stock)}
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 