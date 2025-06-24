import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useBilleteraByUsuario } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  amount: z.number().min(1, { message: 'El monto debe ser mayor a 0' }),
})

export default function OperacionSaldoModal({ open, onOpenChange, operacion }: { open: boolean, onOpenChange: (open: boolean) => void, operacion: 'recargar' | 'retirar' }) {
  const { user } = useAuthStore()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const monto = billetera?.saldo || 0
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  })
  function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {operacion === 'recargar' ? 'Recargar saldo' : 'Retirar saldo'}
          </DialogTitle>
          <DialogDescription>
            {operacion === 'recargar'
              ? 'Ingresa el monto que deseas recargar.'
              : 'Ingresa el monto que deseas retirar.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              rules={{
                required: 'El monto es requerido',
                min: { value: 1, message: 'Debe ser mayor a 0' },
                max: { value: monto, message: 'No puedes retirar más de tu saldo actual' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={monto}
                      step="any"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {operacion === 'recargar' ? 'Recargar' : 'Retirar'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
