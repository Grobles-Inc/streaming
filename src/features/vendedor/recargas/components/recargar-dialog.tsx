import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from '@/components/ui/stepper'
import { useIsMobile } from '@/hooks/use-mobile'
import { RecargaMessage } from '@/lib/whatsapp'
import { useAuth } from '@/stores/authStore'
import { IconPlus } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useCreateRecarga } from '../queries'

const steps = [
  {
    step: 1,
    title: "Solicita tu recarga ingresando el monto.",
    checked: true,
  },
  {
    step: 2,
    title: "Realiza el abono por nuestros canales de pago.",
    checked: true,
  },
  {
    step: 3,
    title: "Tu billetera se actualizará una vez validada la transacción.",
    checked: true,
  },
]


export function RecargarDialog() {
  const isMobile = useIsMobile()
  const tasaConversion = 3.7
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  if (!user?.id) {
    return null
  }
  const { mutate: crearRecarga, isPending } = useCreateRecarga()

  const form = useForm<{ amount: number }>({
    defaultValues: undefined,
  })

  async function onSubmit(data: { amount: number }) {
    try {
      setDialogOpen(false)
      await crearRecarga({
        monto: data.amount,
        usuario_id: user?.id as string,
      })
      form.reset()
      setTimeout(() => {
        RecargaMessage({
          nombre_cliente: user?.nombres + ' ' + user?.apellidos || '',
          monto: data.amount,
          id_cliente: user?.id || '',
        }, '51914019629', isMobile ? 'mobile' : 'web')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  return (
    <>
      <Button className='mr-2'
        onClick={() => setDialogOpen(true)}
      >
        <IconPlus />
        Recargar
      </Button>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Recargar Saldo
            </DialogTitle>
            <DialogDescription className='hidden md:block'>
              Ingresa el monto a recargar y sigue los pasos.
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
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pr-12"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
                            PEN
                          </div>

                        </div>
                        <div className='flex justify-between items-center'>

                          <span className='text-sm text-gray-500'>TC: {tasaConversion} -  {((field.value || 0) / tasaConversion).toFixed(2)} USD</span>
                          <a href="https://wa.me/51941442792" target="_blank" className='flex items-center gap-1 '>
                            <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-6' />
                            <span className='text-green-500 underline text-xs'>+51 941 442 792</span>
                          </a>
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div className="space-y-8 text-center">
                  <Stepper orientation="vertical" >
                    {steps.map(({ step, title, checked }) => (
                      <StepperItem
                        key={step}
                        step={step}
                        completed={checked}
                        className="relative items-start not-last:flex-1"
                      >
                        <StepperTrigger className="items-start rounded pb-4 last:pb-0">
                          <StepperIndicator />
                          <div className="mt-0.5 space-y-0.5 px-2 text-left">
                            <StepperTitle className='text-xs md:text-base'>{title}</StepperTitle>
                          </div>
                        </StepperTrigger>
                        {step < steps.length && (
                          <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                        )}
                      </StepperItem>
                    ))}
                  </Stepper>
                </div>
                <div className='flex gap-4 md:p-4 p-2 justify-between rounded-xl bg-white text-black'>
                  <div className='flex flex-col items-center gap-2'>
                    <div className='flex items-center gap-2'>
                      <img src="https://images.seeklogo.com/logo-png/38/1/yape-logo-png_seeklogo-381640.png" alt="Yape" className="size-14 rounded-xl" />
                      <img src="https://images.seeklogo.com/logo-png/38/1/plin-logo-png_seeklogo-386806.png" alt="Plin" className="size-14" />
                    </div>

                    <p className="text-center text-xs  "><strong className='text-base'>+51 941 442 792</strong> <br /> Maiky Lopez Ramirez.</p>

                  </div>
                  <div className='flex md:flex-row flex-col items-center md:gap-2'>
                    <img src="https://images.seeklogo.com/logo-png/32/1/binance-coin-bnb-logo-png_seeklogo-325081.png" alt="Binance" className="size-14 " />
                    <div className=''>

                      <p className="text-center font-bold">Binance</p>
                      <p className="text-center text-xs">ID: 1096171177</p>
                      <p className="text-center text-xs">Nombre: Maiky L.</p>
                      <p className="text-center text-xs">1 USDT = 3.5 soles</p>
                    </div>
                  </div>

                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className='size-4 animate-spin' /> : 'Solicitar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
