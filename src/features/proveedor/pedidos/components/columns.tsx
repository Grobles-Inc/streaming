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
import { useUpdatePedidoStatusVencido, useCorregirPedidoVencidoIncorrecto } from '../queries'
import { useEffect } from 'react'
import { calcularDiasRestantes, calcularFechaExpiracion, formatearFechaParaMostrar } from '../utils/fecha-utils'





// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

// Componente para manejar días restantes con actualización automática
const DiasRestantesCell = ({ pedido }: { pedido: Pedido }) => {
  const { mutate: updatePedidoStatusVencido } = useUpdatePedidoStatusVencido()
  const { mutate: corregirPedidoVencidoIncorrecto } = useCorregirPedidoVencidoIncorrecto()
  
  const fechaExpiracion = pedido.fecha_expiracion
  const fechaInicio = pedido.fecha_inicio
  const fechaCreacion = pedido.created_at
  const tiempoUso = pedido.productos?.tiempo_uso
  const renovado = pedido.renovado
  const estadoActual = pedido.estado
  const pedidoId = pedido.id
  
  // Verificar si es una renovación por vendedor usando la columna renovado
  const esRenovadoPorVendedor = renovado === true
  
  // Calcular fecha fin y días restantes usando utilidades
  let fechaFin: Date | null = null
  let diasRestantes = 0
  
  if (fechaExpiracion) {
    // Si tiene fecha_expiracion explícita, usar esa
    diasRestantes = calcularDiasRestantes(fechaExpiracion)
    fechaFin = new Date(fechaExpiracion)
  } else {
    // Calcular usando fecha inicio (renovada o original) + tiempo_uso
    let fechaInicioCalcular = fechaCreacion
    if (fechaInicio) {
      fechaInicioCalcular = fechaInicio
    }
    
    if (fechaInicioCalcular && tiempoUso) {
      fechaFin = calcularFechaExpiracion(fechaInicioCalcular, tiempoUso)
      diasRestantes = calcularDiasRestantes(fechaFin)
    }
  }
  
  // Efecto para actualizar automáticamente el estado cuando expire
  useEffect(() => {
    // Estados que pueden actualizarse automáticamente a 'vencido' cuando expiran
    // Excluimos 'renovado' para mantener el historial de renovación
    const estadosActualizables = ['pedido', 'resuelto', 'entregado']
    
    // Solo actualizar cuando diasRestantes < 0 (ya expirado), no cuando = 0 (expira hoy)
    if (diasRestantes < 0 && estadosActualizables.includes(estadoActual) && pedidoId) {
      console.log(`Pedido expirado detectado (estado: ${estadoActual}), actualizando a vencido:`, pedidoId)
      updatePedidoStatusVencido(pedidoId)
    }
  }, [diasRestantes, estadoActual, pedidoId, updatePedidoStatusVencido])

  // Efecto para corregir pedidos marcados incorrectamente como "vencido" cuando aún tienen días restantes
  useEffect(() => {
    // Si el pedido está marcado como "vencido" pero aún tiene días restantes (> 0), corregirlo
    if (estadoActual === 'vencido' && diasRestantes > 0 && pedidoId) {
      console.log(`Pedido marcado incorrectamente como vencido (${pedidoId}) con ${diasRestantes} días restantes, corrigiendo a 'resuelto'`)
      // Lo corregimos a 'resuelto' como estado por defecto para pedidos que no deberían estar vencidos
      corregirPedidoVencidoIncorrecto({ pedidoId, estadoOriginal: 'resuelto' })
    }
  }, [diasRestantes, estadoActual, pedidoId, corregirPedidoVencidoIncorrecto])
  
  // Si no se puede calcular, mostrar N/A
  if (!fechaFin) {
    return (
      <div className='flex justify-center'>
        <Badge variant='secondary' className='text-xs'>
          N/A
        </Badge>
      </div>
    )
  }
  
  // Si es renovado por vendedor
  if (esRenovadoPorVendedor) {
    // Si el pedido renovado ya expiró, mostrar "Expirado" en lugar de "Renovado (0 días restantes)"
    if (diasRestantes <= 0) {
      return (
        <div className='flex justify-center'>
          <Badge variant='destructive' className='text-xs font-medium text-red-600 bg-red-50 border-red-200'>
            Expirado
          </Badge>
        </div>
      )
    }
    
    return (
      <div className='flex justify-center'>
        <Badge variant='outline' className='text-xs font-medium text-purple-600 border-purple-300 bg-purple-50'>
          Renovado ({diasRestantes} días restantes)
        </Badge>
      </div>
    )
  }
  
  // Determinar estilo del badge
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
      
      const badgeColor = estadosMap.get(estado as PedidoEstado)
      return (
        <div className='flex justify-center space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {estado}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as string
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
      const renovado = row.original.renovado
      
      // Verificar si es una renovación por vendedor usando la columna renovado
      const esRenovadoPorVendedor = renovado === true
      
      // Si tiene fecha_inicio explícita, usar esa
      if (fechaInicio) {
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
              {formatearFechaParaMostrar(fechaInicio)}
            </span>
          </div>
        )
      }
      
      // Si no, usar created_at (fecha original)
      if (!fechaCreacion) return <div className='flex justify-center text-sm'>N/A</div>
      
      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
            {formatearFechaParaMostrar(fechaCreacion)}
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
      const renovado = row.original.renovado
      
      // Verificar si es una renovación por vendedor usando la columna renovado
      const esRenovadoPorVendedor = renovado === true
      
      // Si tiene fecha_expiracion explícita (renovación), usar esa
      if (fechaExpiracion) {
        return (
          <div className='flex justify-center'>
            <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
              {formatearFechaParaMostrar(fechaExpiracion)}
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
      
      const fechaFin = calcularFechaExpiracion(fechaInicioCalcular, tiempoUso)
      
      return (
        <div className='flex justify-center'>
          <span className={`text-sm ${esRenovadoPorVendedor ? 'text-purple-600 font-medium' : ''}`}>
            {formatearFechaParaMostrar(fechaFin)}
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
    cell: ({ row }) => <DiasRestantesCell pedido={row.original} />,
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },

] 