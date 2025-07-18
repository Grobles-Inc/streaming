import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { SoporteMessage } from '@/lib/whatsapp'
import { useAuth } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCheck } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Compra } from '../data/schema'
import { useUpdateCompraStatus, useUpdateStockProductoStatus } from '../queries'

const subjectOptions = [
  { value: 'correo', label: 'Correo' },
  { value: 'clave', label: 'Clave' },
  { value: 'pago', label: 'Pago' },
  { value: 'reembolso', label: 'Reembolso' },
  { value: 'activacion', label: 'Activación' },
]

const formSchema = z.object({
  subject: z.string().min(1, 'Debes seleccionar un asunto'),
  message: z.string().min(1, 'El mensaje es requerido').min(4, 'El mensaje debe tener al menos 4 caracteres'),
  response: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ComprasSoporteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

export function ComprasSoporteModal({ open, onOpenChange, currentRow }: ComprasSoporteModalProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { mutate: updateCompraStatus, isPending } = useUpdateCompraStatus()
  const { mutate: updateStockProductoStatus } = useUpdateStockProductoStatus()
  const { fecha_expiracion, productos } = currentRow
  const precio_por_dia = (productos?.precio_renovacion || 0) / (productos?.tiempo_uso || 1)
  const dias_restantes = fecha_expiracion ? Math.ceil((new Date(fecha_expiracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
  const monto_reembolso = precio_por_dia * dias_restantes
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: currentRow.soporte_asunto || '',
      message: currentRow.soporte_mensaje || '',
      response: currentRow.soporte_respuesta || 'Sin respuesta aún',
    },
  })


  async function onSubmit(data: FormData) {
    try {
      onOpenChange(false)
      if (!currentRow.id || !currentRow.stock_producto_id) return
      if (data.subject === 'activacion') {
        await updateCompraStatus({
          id: currentRow.id,
          status: 'pedido',
          message: data.message,
          subject: 'activacion',
        })
      } else if (data.subject === 'reembolso') {
        await updateCompraStatus({
          id: currentRow.id,
          status: 'soporte',
          message: data.message + `\n\nMonto a reembolsar: $ ${(monto_reembolso <= 0 ? 0 : monto_reembolso).toFixed(2)} USD `,
          subject: 'reembolso',
        })
      } else {
        await updateCompraStatus({
          id: currentRow.id,
          status: 'soporte',
          message: data.message,
          subject: data.subject,
        })
      }
      updateStockProductoStatus({
        id: currentRow.stock_producto_id,
      })
      form.reset()
      setTimeout(() => {
        SoporteMessage({
          usuario: user?.usuario || '',
          asunto: data.subject,
          mensaje: data.message,
          id_compra: currentRow.id || 0,
        }, currentRow.usuarios?.telefono || '', isMobile ? 'mobile' : 'web')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleValidarSoporte = () => {
    if (!currentRow.id) return
    updateCompraStatus({
      id: currentRow.id,
      status: "resuelto",
      message: '',
      subject: '',
      response: '',
    })
    onOpenChange(false)
    form.reset()
  }
  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{
            currentRow.soporte_asunto ? 'Detalles del Soporte' : 'Solicitar Soporte'
          }</DialogTitle>
          <DialogDescription>
            <a href={`https://wa.me/${currentRow.usuarios?.telefono}?text=`} className='font-bold  flex items-center gap-2' target="_blank">
              <strong className='text-muted-foreground font-normal'>Proveedor:</strong>
              <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
              <span className='text-green-500'>
                {currentRow.usuarios?.telefono}
              </span>
            </a>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asunto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-3"
                    >
                      {subjectOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem disabled={!!currentRow.soporte_asunto} value={option.value} id={option.value} />
                          <FormLabel htmlFor={option.value}>{option.label}</FormLabel>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {
              form.watch('subject') === 'reembolso' && (
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto a Reembolsar</FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          {...field}
                          value={`$ ${(monto_reembolso <= 0 ? 0 : monto_reembolso).toFixed(2)} USD `}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={!!currentRow.soporte_mensaje}
                      placeholder="Describe tu problema para que el proveedor pueda ayudarte..."
                      className="min-h-[50px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {
              currentRow.soporte_asunto && (
                <FormField
                  control={form.control}
                  name="response"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Respuesta</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled
                          placeholder="Escribe la respuesta del soporte"
                          className="min-h-[50px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }
            <div className="flex justify-end space-x-2">

              {
                currentRow.soporte_asunto ? (
                  <Button type="button" className='bg-green-500 text-white' onClick={handleValidarSoporte} >
                    Validar Soporte
                    <IconCheck className='size-4' />
                  </Button>
                ) : <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className='size-4 animate-spin' /> : 'Enviar'}
                </Button>
              }
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
