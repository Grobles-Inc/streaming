import { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import { Badge } from '@/components/ui/badge'
import { useConfiguracionSistema } from '@/features/proveedor/productos/queries'

// Tipo para transacciones combinadas (recargas + retiros)
type TransaccionCompleta = {
  id: string
  usuario_id: string
  monto: number
  estado: string
  created_at: string
  updated_at: string
  tipo: 'recarga' | 'retiro'
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
  
  // Color diferente según el tipo
  const colorClass = transaccion.tipo === 'recarga' ? 'text-green-600' : 'text-red-600'
  const signo = transaccion.tipo === 'recarga' ? '+' : '-'
  
  return (
    <div className="text-left font-medium">
      <span className={`${colorClass}`}>
        {signo}Dólares: {formattedDolares}
      </span>
      <br />
      <span className='text-muted-foreground text-sm'>
        Equivale a {formattedSoles}
      </span>
    </div>
  )
}

export const columns: ColumnDef<TransaccionCompleta>[] = [
  {
    accessorKey: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      return (
        <Badge 
          variant={tipo === 'recarga' ? 'default' : 'secondary'}
          className={tipo === 'recarga' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {tipo === 'recarga' ? 'Recarga' : 'Retiro'}
        </Badge>
      )
    },
  },
  {
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
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as string
      return (
        <Badge 
          variant={
            estado === 'aprobado' ? 'default' : 
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