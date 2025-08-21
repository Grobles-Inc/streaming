import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { estadosMap } from '../data/data'
import { PedidoEstado, Pedido } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Phone } from 'lucide-react'





// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

export const columns: ColumnDef<Pedido>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      
      return <div className='flex justify-center w-[80px] font-mono text-sm'>{id}</div>
    },
    filterFn: (row, _id, value) => {
      const id = row.getValue('id') as string
      return id.toString().includes(value)
    },
    enableSorting: false,
  },
  {
    accessorKey: 'producto_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => {
      const productoNombre = row.original.productos?.nombre
      
      return (
        <div className='flex justify-center'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[20rem]'>
            {productoNombre || 'Sin producto'}
          </span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const productoNombre = row.original?.productos?.nombre?.toLowerCase() || ''
      return productoNombre.includes(value.toLowerCase())
    },
    enableHiding: false,
    enableSorting: false,
  },

  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { estado } = row.original
      const fechaExpiracion = row.original.fecha_expiracion
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      
      // Un pedido está renovado por vendedor si:
      // Tiene fecha_expiracion explícita Y es MAYOR que la calculada originalmente (extensión por vendedor)
      let esRenovacion = false
      
      if (fechaExpiracion && fechaCreacion && tiempoUso) {
        // Calcular la fecha que debería tener originalmente
        const fechaOriginal = new Date(fechaCreacion)
        const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
        const fechaExpiracionActual = new Date(fechaExpiracion)
        
        // Si la fecha de expiración es MAYOR que la calculada originalmente, fue renovado por vendedor
        // (Las renovaciones del proveedor no extienden, solo cambian, por eso > en lugar de !=)
        esRenovacion = fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
      }
      
      const estadoMostrar = esRenovacion ? 'renovado' : estado
      
      const badgeColor = estadosMap.get(estadoMostrar as PedidoEstado)
      return (
        <div className='flex justify-center space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {estadoMostrar}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as string
      const fechaExpiracion = row.original.fecha_expiracion
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      
      // Si el filtro incluye "renovado", verificar si es una renovación por vendedor
      if (value.includes('renovado')) {
        let esRenovacion = false
        
        if (fechaExpiracion && fechaCreacion && tiempoUso) {
          const fechaOriginal = new Date(fechaCreacion)
          const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
          const fechaExpiracionActual = new Date(fechaExpiracion)
          
          esRenovacion = fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
        }
        
        if (esRenovacion) return true
      }
      
      return value.includes(estado)
    },
    enableHiding: false,
    enableSorting: false,
  },


  {
    accessorKey: 'cliente_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vendedor' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      const nombreCompleto = `${usuario?.nombres} ${usuario?.apellidos}`
      return <div className='flex justify-center'>{nombreCompleto || 'Sin Vendedor'}</div>
    },
    filterFn: (row, _id, value) => {
      const usuario = row.original.usuarios
      const nombreCliente = usuario?.nombres || ''
      const apellidoCliente = usuario?.apellidos || ''
      const nombreCompleto = `${nombreCliente} ${apellidoCliente}`.toLowerCase()
      return nombreCompleto.includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'telefono_whatsapp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const usuario = row.original.usuarios
      const telefono = usuario?.telefono
      
      if (!telefono) {
        return <div className='flex justify-center text-gray-400'>Sin teléfono</div>
      }
      
      return (
        <div className='flex justify-center w-[100px]'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-green-50'
            onClick={() => abrirWhatsApp(telefono as string)}
            title="Abrir en WhatsApp"
          >
            <div className='flex items-center space-x-1'>
              <Phone className='h-4 w-4 text-green-600' />
              <span className='text-xs text-green-600'>{telefono}</span>
            </div>
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'precio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const precio = row.getValue('precio') as number
      return <div className='flex justify-center'>$ {precio.toFixed(2)}</div>
    },
  },
  {
    accessorKey: 'precio_renovacion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio Renovación' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const precioRenovacion = row.original.productos?.precio_renovacion
      return (
        <div className='flex justify-center'>
          {precioRenovacion !== null && precioRenovacion !== undefined
            ? `$ ${precioRenovacion.toFixed(2)}`
            : 'N/A'
          }
        </div>
      )
    },
  },
  {
    accessorKey: 'cuenta_email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email Cuenta' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const email = row.original.stock_productos?.email
      return (
        <div className='flex justify-center'>
          <span className='max-w-32 truncate text-sm sm:max-w-72 md:max-w-[15rem]'>
            {email || 'N/A'}
          </span>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      const email = row.original.stock_productos?.email || ''
      return email.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: 'cuenta_clave',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Clave' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const clave = row.original.stock_productos?.clave
      return (
        <div className='flex justify-center'>
          <span className='max-w-24 truncate text-sm font-mono'>
            {clave || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'cuenta_url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const url = row.original.stock_productos?.url
      return (
        <div className='flex justify-center'>
          {url ? (
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className='text-blue-600 hover:text-blue-800 underline text-sm max-w-32 truncate'
            >
              {url}
            </a>
          ) : (
            <span className='text-sm'>N/A</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'perfil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Perfil' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const perfil = row.original.stock_productos?.perfil
      return (
        <div className='flex justify-center'>
          <span className='text-sm'>
            {perfil || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='PIN' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const pin = row.original.stock_productos?.pin
      return (
        <div className='flex justify-center'>
          <span className='text-sm font-mono'>
            {pin || 'N/A'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_inicio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Inicio' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaInicio = row.original.fecha_inicio
      const fechaCreacion = row.original.created_at
      const fechaExpiracion = row.original.fecha_expiracion
      const tiempoUso = row.original.productos?.tiempo_uso
      
      // Verificar si es una renovación por vendedor
      let esRenovacion = false
      if (fechaExpiracion && fechaCreacion && tiempoUso) {
        const fechaOriginal = new Date(fechaCreacion)
        const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
        const fechaExpiracionActual = new Date(fechaExpiracion)
        
        esRenovacion = fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
      }
      
      // Si tiene fecha_inicio explícita, usar esa
      if (fechaInicio) {
        const fecha = new Date(fechaInicio)
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovacion ? 'text-purple-600 font-medium' : ''}`}>
              {fecha.toLocaleDateString('es-ES')}
            </span>
          </div>
        )
      }
      
      // Si no, usar created_at (fecha original)
      if (!fechaCreacion) return <div className='flex justify-center text-sm'>N/A</div>
      
      const fecha = new Date(fechaCreacion)
      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovacion ? 'text-purple-600 font-medium' : ''}`}>
            {fecha.toLocaleDateString('es-ES')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'fecha_fin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha Fin' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaExpiracion = row.original.fecha_expiracion
      const fechaInicio = row.original.fecha_inicio
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      
      // Verificar si es una renovación por vendedor
      let esRenovacion = false
      if (fechaExpiracion && fechaCreacion && tiempoUso) {
        const fechaOriginal = new Date(fechaCreacion)
        const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
        const fechaExpiracionActual = new Date(fechaExpiracion)
        
        esRenovacion = fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
      }
      
      // Si tiene fecha_expiracion explícita (renovación), usar esa
      if (fechaExpiracion) {
        const fecha = new Date(fechaExpiracion)
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovacion ? 'text-purple-600 font-medium' : ''}`}>
              {fecha.toLocaleDateString('es-ES')}
            </span>
          </div>
        )
      }
      
      // Si no, calcular usando la fecha de inicio (renovada o original) + tiempo_uso
      let fechaInicioCalcular = fechaCreacion
      if (fechaInicio) {
        fechaInicioCalcular = fechaInicio
      }
      
      if (!fechaInicioCalcular || !tiempoUso) {
        return <div className='flex justify-center text-sm'>N/A</div>
      }
      
      const fechaInicioDate = new Date(fechaInicioCalcular)
      const fechaFin = new Date(fechaInicioDate.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
      
      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovacion ? 'text-purple-600 font-medium' : ''}`}>
            {fechaFin.toLocaleDateString('es-ES')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'dias_restantes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Días Restantes' />
    ),
    enableSorting: false,
    cell: ({ row }) => {
      const fechaExpiracion = row.original.fecha_expiracion
      const fechaInicio = row.original.fecha_inicio
      const fechaCreacion = row.original.created_at
      const tiempoUso = row.original.productos?.tiempo_uso
      
      // Verificar si es una renovación por vendedor
      let esRenovacion = false
      if (fechaExpiracion && fechaCreacion && tiempoUso) {
        const fechaOriginal = new Date(fechaCreacion)
        const fechaFinOriginal = new Date(fechaOriginal.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
        const fechaExpiracionActual = new Date(fechaExpiracion)
        
        esRenovacion = fechaExpiracionActual.getTime() > fechaFinOriginal.getTime()
      }
      
      // Calcular fecha fin
      let fechaFin: Date
      
      if (fechaExpiracion) {
        // Si tiene fecha_expiracion explícita, usar esa
        fechaFin = new Date(fechaExpiracion)
      } else {
        // Calcular usando fecha inicio (renovada o original) + tiempo_uso
        let fechaInicioCalcular = fechaCreacion
        if (fechaInicio) {
          fechaInicioCalcular = fechaInicio
        }
        
        if (!fechaInicioCalcular || !tiempoUso) {
          return (
            <div className='flex justify-center'>
              <Badge variant='secondary' className='text-xs'>
                N/A
              </Badge>
            </div>
          )
        }
        
        const fechaInicioDate = new Date(fechaInicioCalcular)
        fechaFin = new Date(fechaInicioDate.getTime() + (tiempoUso * 24 * 60 * 60 * 1000))
      }
      
      const ahora = new Date()
      const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (24 * 60 * 60 * 1000))
      
      if (esRenovacion) {
        return (
          <div className='flex justify-center'>
            <Badge variant='outline' className='text-xs font-medium text-purple-600 border-purple-300 bg-purple-50'>
              Renovado por {diasRestantes > 0 ? diasRestantes : 0} días
            </Badge>
          </div>
        )
      }
      
      let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
      let badgeColor = ''
      
      if (diasRestantes <= 0) {
        badgeVariant = 'destructive'
        badgeColor = 'text-red-600 bg-red-50 border-red-200'
      } else if (diasRestantes <= 3) {
        badgeVariant = 'outline'
        badgeColor = 'text-orange-600 border-orange-300'
      } else if (diasRestantes <= 7) {
        badgeVariant = 'outline'
        badgeColor = 'text-yellow-600 border-yellow-300'
      } else {
        badgeVariant = 'default'
        badgeColor = 'text-green-600 bg-green-50 border-green-200'
      }
      
      return (
        <div className='flex justify-center'>
          <Badge variant={badgeVariant} className={cn('text-xs font-medium', badgeColor)}>
            {diasRestantes <= 0 ? 'Expirado' : `${diasRestantes} días restantes`}
          </Badge>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

] 