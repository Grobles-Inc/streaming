import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useConfiguracionSistema } from '@/features/proveedor/productos/queries'

// Declaración de extensión removida para evitar conflictos de tipos

// Tipo para transacciones combinadas (recargas + retiros + compras)
type TransaccionCompleta = {
  id: string
  usuario_id?: string
  proveedor_id?: string
  vendedor_id?: string | null
  monto: number
  precio?: number
  estado: string
  created_at: string
  updated_at: string
  tipo: 'recarga' | 'retiro' | 'compra'
  // Propiedades específicas para compras
  nombre_cliente?: string
  telefono_cliente?: string
  productos?: {
    nombre: string
    precio_publico: number
  }
  usuarios?: {
    nombres: string
    apellidos: string
    email: string
    telefono: string | null
  } | null
}

// Componente para mostrar el monto con conversión
const MontoCell = ({ transaccion }: { transaccion: TransaccionCompleta }) => {
  const { data: configuracion } = useConfiguracionSistema()
  const tasaConversion = configuracion?.conversion || 3.7
  
  const montoDolares = transaccion.monto // El monto ya está en dólares
  const valorEnSoles = (montoDolares * tasaConversion).toFixed(2)
  
  const formattedDolares = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(montoDolares)
  
  const formattedSoles = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(parseFloat(valorEnSoles))
  
  // Color y signo según el tipo
  let colorClass = ''
  let signo = ''
  let descripcion = ''
  
  switch (transaccion.tipo) {
    case 'recarga':
      colorClass = 'text-green-600'
      signo = '+'
      descripcion = 'Dólares: '
      break
    case 'retiro':
      colorClass = 'text-red-600'
      signo = '-'
      descripcion = 'Dólares: '
      break
    case 'compra':
      colorClass = 'text-blue-600'
      signo = '+'
      descripcion = 'Venta: '
      break
    default:
      colorClass = 'text-gray-600'
      descripcion = 'Dólares: '
  }
  
  return (
    <div className="text-left font-medium space-y-1">
      <span className={`${colorClass}`}>
        {signo}{descripcion}{formattedDolares}
      </span>
      <div className='text-muted-foreground text-sm'>
        Equivale a {formattedSoles}
      </div>
    </div>
  )
}

export const columns: ColumnDef<TransaccionCompleta>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas"
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
    id: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      // Usar el índice absoluto + 1 como ID secuencial
      const sequentialId = row.index + 1
      
      return (
        <div className="w-[80px] font-medium">
          {sequentialId}
        </div>
      )
    },
    enableSorting: false,
    filterFn: (row, value) => {
      // Usar el índice absoluto + 1 como ID secuencial
      const sequentialId = row.index + 1
      return sequentialId.toString().includes(value)
    },
  },
  {
    id: 'tipo',
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      const transaccion = row.original
      
      // Configurar colores y texto según el tipo
      let variant: 'default' | 'secondary' | 'outline' = 'default'
      let className = ''
      let texto = ''
      
      switch (tipo) {
        case 'recarga':
          variant = 'default'
          className = 'bg-green-100 text-green-800'
          texto = 'Recarga'
          break
        case 'retiro':
          variant = 'secondary'
          className = 'bg-red-100 text-red-800'
          texto = 'Retiro'
          break
        case 'compra':
          variant = 'outline'
          className = 'bg-blue-100 text-blue-800'
          texto = 'Venta'
          break
        default:
          texto = tipo
      }
      
      return (
        <div className="space-y-1">
          <Badge variant={variant} className={className}>
            {texto}
          </Badge>
          {tipo === 'compra' && transaccion.productos && (
            <div className="text-xs text-muted-foreground">
              {transaccion.productos.nombre}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('created_at'))
      return (
        <div className="w-[140px]">
          {fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })} {fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    id: 'monto',
    accessorKey: 'monto',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const transaccion = row.original
      return <MontoCell transaccion={transaccion} />
    },
  },
  {
    id: 'detalles',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Detalles" />
    ),
    cell: ({ row }) => {
      const transaccion = row.original
      
      switch (transaccion.tipo) {
        case 'compra':
          return (
            <div className="space-y-1">
              {transaccion.usuarios && (
                <div className="text-sm">
                  <span className="font-medium">Vendedor:</span> {transaccion.usuarios.nombres} {transaccion.usuarios.apellidos}
                </div>
              )}
              {transaccion.usuarios?.telefono && (
                <div className="text-xs text-muted-foreground">
                  Tel: {transaccion.usuarios.telefono}
                </div>
              )}
            </div>
          )
        case 'recarga':
        case 'retiro':
          return (
            <div className="text-sm text-muted-foreground">
              Transacción de {transaccion.tipo}
            </div>
          )
        default:
          return null
      }
    },
    enableSorting: false,
  },
  {
    id: 'estado',
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string
      return (
        <Badge 
          variant={
            estado === 'aprobado' || estado === 'completado' ? 'default' : 
            estado === 'pendiente' ? 'secondary' : 
            'destructive'
          }
        >
          {estado}
        </Badge>
      )
    },
  },
] 