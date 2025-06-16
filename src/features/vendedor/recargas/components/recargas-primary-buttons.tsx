import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSaldo } from '@/stores/balanceStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRecargas } from '../context/recargas-context'

const formSchema = z.object({
  monto: z.number().min(1, { message: 'El monto es requerido' }),
})

export function RecargasPrimaryButtons() {
  const { setOpen } = useRecargas()
  const [dialogOpen, setDialogOpen] = useState(false)
  const { actualizarSaldo } = useSaldo()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { monto: 0 },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    actualizarSaldo(data.monto)
    setDialogOpen(false)
    form.reset()
  }

  return (
    <>
      <div className='flex gap-2'>
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Crear</span> <IconPlus size={18} />
        </Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Recargar saldo
            </DialogTitle>
            <DialogDescription>
              Ingresa el monto que deseas recargar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="monto"
                rules={{
                  required: 'El monto es requerido',
                  min: { value: 1, message: 'Debe ser mayor a 0' },

                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
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
                Recargar
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
