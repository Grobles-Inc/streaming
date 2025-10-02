import { useState, useCallback, memo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  IconCheck,
  IconX,
  IconEye,
  IconClock,
  IconCurrencyDollar
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { MappedCompra } from '../data/types'

/**
 * Reglas de transición de estados para compras:
 * 
 * - soporte → puede cambiar a: reembolsado, resuelto
 * - reembolsado → puede cambiar a: resuelto
 * - resuelto → puede cambiar a: soporte
 * - vencido → puede cambiar a: resuelto
 * - pedido_entregado → puede cambiar a: soporte, resuelto
 */

// Función para obtener el badge del estado
function getEstadoBadge(estado: string) {
  switch (estado) {
    case 'resuelto':
      return {
        variant: 'default' as const,
        label: 'Resuelto',
        className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        icon: IconCheck
      }
    case 'vencido':
      return {
        variant: 'destructive' as const,
        label: 'Vencido',
        className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        icon: IconX
      }
    case 'soporte':
      return {
        variant: 'secondary' as const,
        label: 'Soporte',
        className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        icon: IconClock
      }
    case 'reembolsado':
      return {
        variant: 'outline' as const,
        label: 'Reembolsado',
        className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
        icon: IconCurrencyDollar
      }
    case 'pedido_entregado':
      return {
        variant: 'secondary' as const,
        label: 'Pedido Entregado',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        icon: IconCheck
      }
    default:
      return {
        variant: 'outline' as const,
        label: estado,
        className: '',
        icon: IconClock
      }
  }
}

// Función para determinar qué acciones están permitidas según el estado
function getAccionesPermitidas(estado: string) {
  switch (estado) {
    case 'soporte':
      return {
        puedeReembolsar: true,
        puedeMarcarResuelto: true,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: false
      }
    case 'reembolsado':
      return {
        puedeReembolsar: false,
        puedeMarcarResuelto: true,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: false
      }
    case 'resuelto':
      return {
        puedeReembolsar: false,
        puedeMarcarResuelto: false,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: true
      }
    case 'vencido':
      return {
        puedeReembolsar: false,
        puedeMarcarResuelto: true,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: false
      }
    case 'pedido_entregado':
      return {
        puedeReembolsar: false,
        puedeMarcarResuelto: true,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: true
      }
    default:
      return {
        puedeReembolsar: false,
        puedeMarcarResuelto: false,
        puedeMarcarVencido: false,
        puedeEnviarASoporte: false
      }
  }
}

// Props para las acciones - simplificadas
interface ComprasTableActionsProps {
  compra: MappedCompra
  onMarcarResuelto: (id: number) => Promise<void>
  onMarcarVencido: (id: number) => Promise<void>
  onEnviarASoporte: (id: number) => Promise<void>
  onProcesarReembolso: (id: number) => Promise<void>
  onVer: (compra: MappedCompra) => void | Promise<void>
}

// Componente de acciones simple y estable
const ComprasTableActions = memo(function ComprasTableActions({
  compra,
  onMarcarResuelto,
  onMarcarVencido,
  onEnviarASoporte,
  onProcesarReembolso,
  onVer
}: ComprasTableActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  // Obtener acciones permitidas según el estado actual
  const acciones = getAccionesPermitidas(compra.estado)

  const handleAction = useCallback(async (action: () => Promise<void>) => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      await action()
    } catch (error) {
      console.error('Error en acción:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing])

  const handleVer = useCallback(() => {
    onVer(compra)
  }, [onVer, compra])

  const handleMarcarResuelto = useCallback(() => {
    handleAction(() => onMarcarResuelto(compra.id))
  }, [handleAction, onMarcarResuelto, compra.id])

  const handleMarcarVencido = useCallback(() => {
    handleAction(() => onMarcarVencido(compra.id))
  }, [handleAction, onMarcarVencido, compra.id])

  const handleEnviarASoporte = useCallback(() => {
    handleAction(() => onEnviarASoporte(compra.id))
  }, [handleAction, onEnviarASoporte, compra.id])

  const handleProcesarReembolso = useCallback(() => {
    handleAction(() => onProcesarReembolso(compra.id))
  }, [handleAction, onProcesarReembolso, compra.id])

  return (
    <div className="flex items-center gap-1">
      {/* Botón Ver siempre disponible */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleVer}
        className="h-8 w-8 p-0"
        title="Ver detalles"
        disabled={isProcessing}
      >
        <IconEye className="h-4 w-4" />
      </Button>

      {/* Marcar como resuelto */}
      {acciones.puedeMarcarResuelto && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarcarResuelto}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
          title="Marcar como resuelto"
          disabled={isProcessing}
        >
          <IconCheck className="h-4 w-4" />
        </Button>
      )}

      {/* Marcar como vencido */}
      {acciones.puedeMarcarVencido && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarcarVencido}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          title="Marcar como vencido"
          disabled={isProcessing}
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}

      {/* Enviar a soporte */}
      {acciones.puedeEnviarASoporte && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnviarASoporte}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="Enviar a soporte"
          disabled={isProcessing}
        >
          <IconClock className="h-4 w-4" />
        </Button>
      )}

      {/* Procesar reembolso */}
      {acciones.puedeReembolsar && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleProcesarReembolso}
          className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
          title="Procesar reembolso"
          disabled={isProcessing}
        >
          <IconCurrencyDollar className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
})

// Definir las columnas - simplificadas
export function createComprasColumns(
  onMarcarResuelto: (id: number) => Promise<void>,
  onMarcarVencido: (id: number) => Promise<void>,
  onEnviarASoporte: (id: number) => Promise<void>,
  onProcesarReembolso: (id: number) => Promise<void>,
  onVer: (compra: MappedCompra) => void | Promise<void>
): ColumnDef<MappedCompra>[] {
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
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as number
        return (
          <div className=" text-xs">
            {id.toString()}
          </div>
        )
      },
    },
    {
      accessorKey: 'nombreCliente',
      header: 'Cliente',
      cell: ({ row }) => {
        const nombre = row.getValue('nombreCliente') as string
        const telefono = row.original.telefonoCliente
        return (
          <div className="space-y-1">
            <div className="font-medium">{nombre}</div>
            <div className="text-xs text-muted-foreground">{telefono}</div>
          </div>
        )
      },
      enableHiding: true
    },
    {
      accessorKey: 'productoNombre',
      header: 'Producto',
      cell: ({ row }) => {
        const producto = row.getValue('productoNombre') as string
        return (
          <div className="font-medium">{producto}</div>
        )
      },
    },
    {
      accessorKey: 'proveedorNombre',
      header: 'Proveedor',
      cell: ({ row }) => {
        const proveedor = row.getValue('proveedorNombre') as string
        return (
          <div className="text-sm text-muted-foreground">{proveedor}</div>
        )
      },
    },
    {
      accessorKey: 'vendedorNombre',
      header: 'Vendedor',
      cell: ({ row }) => {
        const vendedor = row.getValue('vendedorNombre') as string | undefined
        return (
          <div className="text-sm text-muted-foreground">
            {vendedor || <span className="text-xs text-muted-foreground">Sin vendedor</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'precioFormateado',
      header: 'Precio',
      cell: ({ row }) => {
        const precioFormateado = row.getValue('precioFormateado') as string
        return (
          <div className="text-right ">
            <Badge className="text-sm">
              {precioFormateado}
            </Badge>
          </div>
        )
      },
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string
        const badge = getEstadoBadge(estado)
        const Icon = badge.icon
        return (
          <div className="flex items-center gap-2">
            <Badge variant={badge.variant} className={badge.className}>
              <Icon className="mr-1 h-3 w-3" />
              {badge.label}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'stockProductoId',
      header: 'Stock ID',
      cell: ({ row }) => {
        const stockId = row.getValue('stockProductoId') as number | null
        return (
          <div className="text-center">
            {stockId ? (
              <Badge className="text-sm">
                #{stockId}
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">Sin stock</span>
            )}
          </div>
        )
      },
      enableHiding: true
    },
    {
      accessorKey: 'emailCuenta',
      header: 'Email Cuenta',
      cell: ({ row }) => {
        const email = row.getValue('emailCuenta') as string
        return (
          <div className=" text-sm max-w-[200px] truncate" title={email}>
            {email}
          </div>
        )
      },
      enableHiding: true
    },
    {
      accessorKey: 'perfilUsuario',
      header: 'Perfil',
      cell: ({ row }) => {
        const perfil = row.getValue('perfilUsuario') as string | null
        return (
          <div className="max-w-[150px] truncate">
            {perfil || <span className="text-xs text-muted-foreground">Sin perfil</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'fechaExpiracion',
      header: 'Fecha Expiración',
      cell: ({ row }) => {
        const fecha = row.getValue('fechaExpiracion') as Date | null

        if (!fecha) {
          return <span className="text-xs text-muted-foreground">Sin expiración</span>
        }

        const esVencida = fecha < new Date()

        return (
          <div className={cn("space-y-1", esVencida && "text-red-600")}>
            <div className="text-sm">
              {fecha.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="text-xs">
              {fecha.toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {esVencida && (
              <Badge variant="destructive" className="text-xs">
                Vencida
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'soporteMensaje',
      header: 'Soporte',
      cell: ({ row }) => {
        const mensaje = row.getValue('soporteMensaje') as string | null
        const asunto = row.original.soporteAsunto
        const respuesta = row.original.soporteRespuesta

        if (!mensaje && !asunto && !respuesta) {
          return <span className="text-xs text-muted-foreground">Sin soporte</span>
        }

        return (
          <div className="space-y-1 max-w-[200px]">
            {asunto && (
              <div className="text-sm font-medium truncate" title={asunto}>
                {asunto}
              </div>
            )}
            {mensaje && (
              <div className="text-xs text-muted-foreground truncate" title={mensaje}>
                {mensaje}
              </div>
            )}
            {respuesta && (
              <Badge variant="outline" className="text-xs">
                Respondido
              </Badge>
            )}
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
      accessorKey: 'fechaActualizacion',
      header: 'Última Actualización',
      cell: ({ row }) => {
        const fecha = row.original.fechaActualizacion

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
      enableHiding: true
    },
    {
      accessorKey: 'montoReembolsoFormateado',
      header: 'Reembolso',
      cell: ({ row }) => {
        const monto = row.original.montoReembolso
        const montoFormateado = row.getValue('montoReembolsoFormateado') as string

        if (monto <= 0) {
          return <span className="text-xs text-muted-foreground">No aplica</span>
        }

        return (
          <div className="text-right ">
            <Badge variant="secondary" className="text-sm">
              {montoFormateado}
            </Badge>
          </div>
        )
      },
      meta: {
        className: 'text-right',
      },
    },
    {
      accessorKey: 'tiempoTranscurrido',
      header: 'Días restantes',
      cell: ({ row }) => {
        const tiempo = row.getValue('tiempoTranscurrido') as string

        // Función para determinar el color basado en el tiempo restante
        const getTimeColor = (tiempoStr: string) => {
          if (tiempoStr.includes('Vencido') || tiempoStr.includes('Vence hoy')) {
            return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
          }

          if (tiempoStr.includes('Sin expiración')) {
            return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }

          // Extraer número de días del string
          const matchDias = tiempoStr.match(/(\d+)\s+día/)
          if (matchDias) {
            const dias = parseInt(matchDias[1])
            if (dias < 0) {
              return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            } else if (dias <= 10) {
              return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
            } else {
              return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
            }
          }

          return 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }

        return (
          <div className="text-sm text-center">
            <Badge variant="outline" className={`text-xs ${getTimeColor(tiempo)}`}>
              {tiempo}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      enableHiding: false,
      cell: ({ row }) => (
        <ComprasTableActions
          compra={row.original}
          onMarcarResuelto={onMarcarResuelto}
          onMarcarVencido={onMarcarVencido}
          onEnviarASoporte={onEnviarASoporte}
          onProcesarReembolso={onProcesarReembolso}
          onVer={onVer}
        />
      ),
    },
  ]
}
