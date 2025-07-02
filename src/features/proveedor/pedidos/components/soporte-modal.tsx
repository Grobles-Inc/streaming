import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SoporteCompra } from '../data/types'
import { useUpdateSoporteStatus } from '../queries'
import { toast } from 'sonner'

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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      respuesta: '',
      estado: compra.stock_productos?.soporte_stock_producto || 'activo',
    },
  })

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

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
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