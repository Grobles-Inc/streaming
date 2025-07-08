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
import { useConfiguracionSistema, useCreateRecarga } from '../queries'
import YapeQRImage from '@/assets/YapeQR.jpg'

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
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  if (!user?.id) {
    return null
  }
  const { mutate: crearRecarga, isPending } = useCreateRecarga()
  const { data: configuracion } = useConfiguracionSistema()
  const form = useForm<{ amount: number }>({
    defaultValues: undefined,
  })

  async function onSubmit(data: { amount: number }) {
    const dollarAmount = data.amount / (configuracion?.conversion ?? 1)
    try {
      setDialogOpen(false)
      await crearRecarga({
        monto: Number(dollarAmount.toFixed(2)),
        usuario_id: user?.id as string,
      })
      form.reset()
      setTimeout(() => {
        RecargaMessage({
          nombre_cliente: user?.nombres + ' ' + user?.apellidos || '',
          monto: data.amount,
          id_cliente: user?.id || '',
        }, '51913190401', isMobile ? 'mobile' : 'web')
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

                          <span className='text-sm text-gray-500'>TC: {configuracion?.conversion} -  {((field.value || 0) / (configuracion?.conversion ?? 1)).toFixed(2)} USD</span>
                          <a href="https://wa.me/51913190401" target="_blank" className='flex items-center gap-1 '>
                            <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-5' />
                            <span className='text-green-500 underline text-xs'>913190401</span>
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
                <div className='flex items-center justify-between'>
                  <img src={YapeQRImage} alt="Yape" className='md:size-52 size-28' />
                  <div className='flex flex-col gap-4 md:p-4 p-2 justify-between rounded-xl bg-white text-black'>
                    <div className='flex flex-col  gap-2'>
                      <div className='flex items-center gap-2'>
                        <img src="https://images.seeklogo.com/logo-png/38/1/yape-logo-png_seeklogo-381640.png" alt="Yape" className="md:size-14 size-10" />
                        <img src="https://images.seeklogo.com/logo-png/38/1/plin-logo-png_seeklogo-386806.png" alt="Plin" className="md:size-14 size-10" />
                      </div>

                      <p className=" text-xs  "><strong className='text-base'>+51 913 190 401</strong> <br /> Maiky Lopez Ramirez.</p>

                    </div>
                    <div className='flex flex-row items-center md:gap-2'>
                      <div className=''>

                        <p className=" font-bold">Binance</p>
                        <p className=" text-xs">ID: 1096171177</p>
                        <p className=" text-xs">Nombre: Maiky L.</p>
                        <p className=" text-xs">1 USDT = 3.5 soles</p>
                      </div>
                      <img src="https://images.seeklogo.com/logo-png/32/1/binance-coin-bnb-logo-png_seeklogo-325081.png" alt="Binance" className="md:size-14 size-10 " />
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
