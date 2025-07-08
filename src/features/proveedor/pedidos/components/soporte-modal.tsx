import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader, IconCurrencyDollar, IconCheck } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SoporteCompra } from '../data/types'
import { useUpdateSoporteStatus, useProcesarReembolso } from '../queries'
import { toast } from 'sonner'
import { useAuth } from '@/stores/authStore'
import { useState } from 'react'

const estadoOptions = [
  { value: 'activo', label: 'Problema Resuelto', color: 'bg-green-400 text-green-800' },
  { value: 'soporte', label: 'Soporte', color: 'bg-orange-400 text-orange-800' },
  { value: 'vencido', label: 'Cuenta Vencida', color: 'bg-red-400 text-red-800' },
]

const formSchema = z.object({
  respuesta: z.string().optional(),
  estado: z.enum(['activo', 'soporte', 'vencido']),
})

type FormData = z.infer<typeof formSchema>

interface SoporteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: SoporteCompra
  onClose: () => void
}

export function SoporteModal({ open, onOpenChange, compra, onClose }: SoporteModalProps) {
  const { mutate: updateStatus, isPending } = useUpdateSoporteStatus()
  const { mutate: procesarReembolso, isPending: isPendingReembolso } = useProcesarReembolso()
  const { user } = useAuth()
  const [showReembolsoConfirm, setShowReembolsoConfirm] = useState(false)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      respuesta: '',
      estado: compra.stock_productos?.soporte_stock_producto || 'activo',
    },
  })

  // Extraer el monto del reembolso del mensaje del vendedor
  const extraerMontoReembolso = (mensaje: string): number => {
    const regex = /Monto a reembolsar:\s*\$\s*([\d,]+\.?\d*)/i
    const match = mensaje.match(regex)
    if (match) {
      const montoStr = match[1].replace(/,/g, '')
      return parseFloat(montoStr) || 0
    }
    return 0
  }

  const montoReembolso = compra.soporte_mensaje ? extraerMontoReembolso(compra.soporte_mensaje) : 0
  const esReembolso = compra.soporte_asunto === 'reembolso'
  const reembolsoYaProcesado = compra.estado === 'reembolsado'

  async function onSubmit(data: FormData) {
    // Proceder directamente con la actualización
    await executeUpdate(data)
  }

  async function executeUpdate(data: FormData) {
    try {
      if (!compra.stock_productos?.id) {
        toast.error('Error: No se encontró el ID del stock de producto')
        return
      }

      await updateStatus({
        stockProductoId: compra.stock_productos.id,
        estado: data.estado,
        respuesta: data.respuesta || undefined,
      })

      toast.success('Estado de soporte actualizado correctamente')
      
      form.reset()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el estado de soporte')
    }
  }

  const handleProcesarReembolso = async () => {
    if (!compra.vendedor_id || !user?.id || montoReembolso <= 0) {
      toast.error('Error: Datos insuficientes para procesar el reembolso')
      return
    }

    procesarReembolso({
      compraId: compra.id,
      proveedorId: user.id,
      vendedorId: compra.vendedor_id,
      montoReembolso: montoReembolso
    }, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success('Reembolso procesado exitosamente. Puedes enviar un mensaje de respuesta al vendedor.')
          setShowReembolsoConfirm(false)
          // No cerramos el modal para permitir enviar mensaje de respuesta
        } else {
          toast.error(result.error || 'Error al procesar el reembolso')
        }
      },
      onError: (error) => {
        console.error('Error procesando reembolso:', error)
        toast.error('Error al procesar el reembolso')
      }
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setShowReembolsoConfirm(false)
  }

  const asuntoMap: Record<string, string> = {
    correo: 'Correo',
    clave: 'Clave',
    pago: 'Pago',
    reembolso: 'Reembolso',
    geo: 'Geolocalización',
    codigo: 'Código',
    otros: 'Otros'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Gestionar Caso de Soporte
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                Problema Reportado
              </h4>
              <div className="space-y-2">
                {compra.soporte_asunto && (
                  <div>
                    <span className="text-sm text-muted-foreground">Asunto: </span>
                    <Badge variant="outline">
                      {asuntoMap[compra.soporte_asunto] || compra.soporte_asunto}
                    </Badge>
                  </div>
                )}
                {compra.soporte_mensaje && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mensaje del vendedor:</p>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">{compra.soporte_mensaje}</p>
                    </div>
                  </div>
                )}
                {compra.soporte_respuesta && (
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">Tu respuesta anterior:</p>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-700">
                      <p className="text-sm text-green-800 dark:text-green-200">{compra.soporte_respuesta}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Reembolso */}
            {esReembolso && montoReembolso > 0 && (
              <>
                {reembolsoYaProcesado ? (
                  // Reembolso ya procesado
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700">
                    <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <IconCheck className="h-4 w-4" />
                      Reembolso Realizado
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600 dark:text-green-300">Monto reembolsado:</span>
                        <span className="font-mono font-semibold text-green-800 dark:text-green-200">
                          ${montoReembolso.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 p-2 rounded-md">
                        <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                          El reembolso ha sido procesado exitosamente. Los fondos fueron transferidos al vendedor.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Solicitud de reembolso pendiente
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-700">
                    <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <IconCurrencyDollar className="h-4 w-4" />
                      Solicitud de Reembolso
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600 dark:text-red-300">Monto solicitado:</span>
                        <span className="font-mono font-semibold text-red-800 dark:text-red-200">
                          ${montoReembolso.toFixed(2)} USD
                        </span>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        Este monto se descontará de tu billetera y se transferirá al vendedor.
                      </p>
                      {!showReembolsoConfirm ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowReembolsoConfirm(true)}
                          className="w-full mt-2"
                        >
                          <IconCurrencyDollar className="mr-2 h-4 w-4" />
                          Procesar Reembolso
                        </Button>
                      ) : (
                        <div className="space-y-2 mt-2">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            ¿Estás seguro de procesar este reembolso?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleProcesarReembolso}
                              disabled={isPendingReembolso}
                              className="flex-1"
                            >
                              {isPendingReembolso && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
                              Confirmar Reembolso
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowReembolsoConfirm(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {compra.stock_productos && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Datos de la Cuenta
                </h4>
                <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                  {compra.stock_productos.email && (
                    <p><span className="font-medium">Email:</span> {compra.stock_productos.email}</p>
                  )}
                  {compra.stock_productos.clave && (
                    <p><span className="font-medium">Clave:</span> {compra.stock_productos.clave}</p>
                  )}
                  {compra.stock_productos.perfil && (
                    <p><span className="font-medium">Perfil:</span> {compra.stock_productos.perfil}</p>
                  )}
                </div>
              </div>
            )}
            <Separator />

            {/* Formulario de respuesta */}
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Soporte</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadoOptions.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${estado.color}`} />
                                {estado.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="respuesta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Respuesta al Cliente (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe tu respuesta para el cliente. Este mensaje se enviará al vendedor para que lo reenvíe..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </div>

          {/* Botones fijos en la parte inferior */}
          <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Soporte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
} 