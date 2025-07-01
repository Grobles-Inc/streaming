import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { SoporteMessage } from '@/lib/whatsapp'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Compra } from '../data/schema'
import { useUpdateCompraStatus } from '../queries'

const subjectOptions = [
  { value: 'correo', label: 'Correo' },
  { value: 'clave', label: 'Clave' },
  { value: 'pago', label: 'Pago' },
  { value: 'reembolso', label: 'Reembolso' },
  { value: 'geo', label: 'Geo' },
  { value: 'codigo', label: 'Código' },
  { value: 'otros', label: 'Otros' },
]

const formSchema = z.object({
  subject: z.string().min(1, 'Debes seleccionar un asunto'),
  message: z.string().min(1, 'El mensaje es requerido').min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

type FormData = z.infer<typeof formSchema>

interface ComprasSoporteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

export function ComprasSoporteModal({ open, onOpenChange, currentRow }: ComprasSoporteModalProps) {
  const isMobile = useIsMobile()
  const { mutate: updateCompraStatus, isPending } = useUpdateCompraStatus()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      onOpenChange(false)
      await updateCompraStatus({
        id: currentRow.stock_producto_id,
        status: "soporte",
        message: data.message,
        subject: data.subject,
      })
      form.reset()
      setTimeout(() => {
        SoporteMessage({
          nombre_cliente: currentRow.nombre_cliente,
          asunto: data.subject,
          mensaje: data.message,
          id_producto: currentRow.producto_id || '',
          id_cliente: currentRow.vendedor_id || '',
        }, currentRow.usuarios?.telefono || '', isMobile ? 'mobile' : 'web')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Soporte</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-2 text-muted-foreground'>Asunto</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid grid-cols-3"
                    >
                      {subjectOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <FormLabel htmlFor={option.value}>{option.label}</FormLabel>
                        </div>
                      ))}
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
                      placeholder="Describe tu problema para que el proveedor pueda ayudarte..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className='size-4 animate-spin' /> : 'Enviar'}

              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
