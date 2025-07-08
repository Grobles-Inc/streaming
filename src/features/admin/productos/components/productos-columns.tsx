import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  IconEye, 
  IconTrash, 
  IconCopy,
  IconPackage,
  IconClock,
  IconStar,
  IconCheck,
  IconX,
  IconRefresh,
  IconShoppingCart
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { MappedProducto } from '../data/types'

// Props para las acciones
interface ProductosTableActionsProps {
  producto: MappedProducto
  onVer: (producto: MappedProducto) => void
  onEliminar: (id: string) => Promise<void>
  onDuplicar: (id: string) => Promise<void>
}

// Componente de acciones
function ProductosTableActions({ 
  producto, 
  onVer, 
  onEliminar,
  onDuplicar
}: ProductosTableActionsProps) {
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
        <DropdownMenuItem onClick={() => onVer(producto)}>
          <IconEye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onDuplicar(producto.id.toString())}>
          <IconCopy className="mr-2 h-4 w-4" />
          Duplicar
        </DropdownMenuItem>
        
        {producto.puedeEliminar && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onEliminar(producto.id.toString())}
              className="text-red-600 focus:text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Definir las columnas
export function createProductosColumns(
  onVer: (producto: MappedProducto) => void,
  onEliminar: (id: string) => Promise<void>,
  onDuplicar: (id: string) => Promise<void>
): ColumnDef<MappedProducto>[] {
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
      accessorKey: 'nombre',
      header: 'Producto',
      cell: ({ row }) => {
        const producto = row.original
        return (
          <div className="flex items-center space-x-3 max-w-[300px]">
            <Avatar className="h-10 w-10">
              <AvatarImage src={producto.imagenUrl || ''} alt={producto.nombre} />
              <AvatarFallback>
                <IconPackage className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{producto.nombre}</div>
              <div className="text-xs text-muted-foreground">
                {producto.categoriaNombre}
              </div>
              {producto.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {producto.etiquetas.slice(0, 2).map((etiqueta) => (
                    <Badge key={etiqueta} variant="outline" className="text-xs">
                      {etiqueta}
                    </Badge>
                  ))}
                  {producto.etiquetas.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{producto.etiquetas.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              {/* Badges de características */}
              <div className="flex flex-wrap gap-1 mt-1">
                {producto.nuevo && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    <IconStar className="mr-1 h-2 w-2" />
                    Nuevo
                  </Badge>
                )}

              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'proveedorNombre',
      header: 'Proveedor',
      cell: ({ row }) => {
        const proveedor = row.getValue('proveedorNombre') as string
        return (
          <div className="max-w-[150px] truncate">
            <span className="font-medium">{proveedor}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'precioPublicoFormateado',
      header: 'Precios',
      cell: ({ row }) => {
        const precio = row.getValue('precioPublicoFormateado') as string
        const producto = row.original
        return (
          <div className="space-y-1">
            <div className="text-right font-mono">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-md text-sm font-medium',
                'bg-green-50 text-green-700 border border-green-200'
              )}>
                {precio}
              </span>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              Vendedor: {producto.precioVendedorFormateado}
            </div>
            {producto.precioRenovacionFormateado && (
              <div className="text-xs text-muted-foreground text-right">
                Renovación: {producto.precioRenovacionFormateado}
              </div>
            )}
          </div>
        )
      },
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: 'configuracion',
      header: 'Configuración',
      cell: ({ row }) => {
        const producto = row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Badge variant={producto.aPedido ? "default" : "outline"} className="text-xs">
                {producto.aPedido ? "A Pedido" : "Stock"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={producto.renovable ? "default" : "outline"} className="text-xs">
                <IconRefresh className="mr-1 h-2 w-2" />
                {producto.renovable ? "Renovable" : "No Renovable"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {producto.muestraDisponibilidadStock ? (
                <IconCheck className="h-3 w-3 text-green-600" />
              ) : (
                <IconX className="h-3 w-3 text-red-600" />
              )}
              <span className="text-xs text-muted-foreground">Muestra Stock</span>
            </div>
            <div className="flex items-center gap-1">
              {producto.deshabilitarBotonComprar ? (
                <IconX className="h-3 w-3 text-red-600" />
              ) : (
                <IconShoppingCart className="h-3 w-3 text-green-600" />
              )}
              <span className="text-xs text-muted-foreground">Botón Comprar</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'tiempoUsoFormateado',
      header: 'Tiempo de Uso',
      cell: ({ row }) => {
        const tiempo = row.getValue('tiempoUsoFormateado') as string
        return (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              <IconClock className="mr-1 h-3 w-3" />
              {tiempo}
            </Badge>
          </div>
        )
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
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ProductosTableActions
          producto={row.original}
          onVer={onVer}
          onEliminar={onEliminar}
          onDuplicar={onDuplicar}
        />
      ),
    },
  ]
}
