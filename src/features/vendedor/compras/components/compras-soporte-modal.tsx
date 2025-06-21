import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import { SoporteMessage } from '@/lib/whatsapp'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Compra } from '../data/schema'

const subjectOptions = [
  { value: 'soporte', label: 'Soporte' },
  { value: 'reembolso', label: 'Reembolso' },
  { value: 'otro', label: 'Otro' },
  { value: 'vencido', label: 'Cuenta vencida' },
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  })

  const onSubmit = (data: FormData) => {
    onOpenChange(false)
    SoporteMessage({
      nombre_cliente: currentRow.nombre_cliente,
      asunto: data.subject,
      mensaje: data.message,
      id_producto: currentRow.producto_id || '',
      id_cliente: currentRow.vendedor_id || '',
    }, currentRow.usuarios?.telefono || '', isMobile ? 'mobile' : 'web')
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
          <DialogTitle>Comunicate con el proveedor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
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
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu problema..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Enviar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
