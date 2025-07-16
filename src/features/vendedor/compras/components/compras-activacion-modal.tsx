import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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
import { useUpdateCompraStatus } from '../queries'


const formSchema = z.object({
  message: z.string().min(1, 'El mensaje es requerido').min(4, 'El mensaje debe tener al menos 4 caracteres'),
  response: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ComprasActivacionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

export function ComprasActivacionModal({ open, onOpenChange, currentRow }: ComprasActivacionModalProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { mutate: updateCompraStatus, isPending } = useUpdateCompraStatus()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: currentRow.soporte_mensaje || '',
      response: currentRow.soporte_respuesta || 'Sin respuesta aún',
    },
  })


  async function onSubmit(data: FormData) {
    try {
      onOpenChange(false)
      if (!currentRow.id) return
      await updateCompraStatus({
        id: currentRow.id,
        status: "pedido",
        message: data.message,
        subject: 'activacion',
      })
      form.reset()
      onOpenChange(false)
      SoporteMessage({
        usuario: user?.usuario || '',
        asunto: 'activacion',
        mensaje: data.message,
        id_producto: currentRow.producto_id,
        id_cliente: currentRow.vendedor_id || '',
      }, currentRow.usuarios?.telefono || '', isMobile ? 'mobile' : 'web')
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
            currentRow.soporte_asunto ? 'Detalles de la Activación' : 'Solicitar Activación'
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-2 text-muted-foreground'>Asunto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={'activacion'}
                      className='flex gap-2 items-center'
                    >
                      <RadioGroupItem checked disabled value={'activacion'} id={'activacion'} />
                      <FormLabel htmlFor={'activacion'}>Activación</FormLabel>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      disabled={!!currentRow.soporte_mensaje}
                      placeholder="Mensaje de activación..."
                      className="min-h-[100px]"
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
                      <FormLabel className='mb-2 text-muted-foreground'>Respuesta por el Proveedor</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled
                          placeholder="Escribe la respuesta del soporte"
                          className="min-h-[100px]"
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
                    Validar Activación
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
