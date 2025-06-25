import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { RecargaMessage } from '@/lib/whatsapp'
import { useBilleteraByUsuario, useUpdateBilleteraSaldo } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { IconPlus } from '@tabler/icons-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

const steps = [
  {
    step: 1,
    title: "Paso 1",
    description: "Ingresa el monto a recargar. (Incluye comisiones)",
  },
  {
    step: 2,
    title: "Paso 2",
    description: "Selecciona el método de pago y realiza el pago. (Yape, Plinea, Binance)",
  },
  {
    step: 3,
    title: "Paso 3",
    description: "El administrador actualizará el saldo de tu billetera. una vez validada la transacción.",
  },
]


export function RecargarDialog() {
  const isMobile = useIsMobile()
  const tasaConversion = 3.7
  const { user } = useAuthStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  if (!user?.id) {
    return null
  }
  const { data: billetera } = useBilleteraByUsuario(user.id)
  const { mutate: actualizarSaldo } = useUpdateBilleteraSaldo()
  const monto = billetera?.saldo || 0

  const form = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  })

  function onSubmit(data: { amount: number }) {
    setDialogOpen(false)

    const nuevoMonto = monto + data.amount

    actualizarSaldo({ id: billetera?.id || '', nuevoSaldo: nuevoMonto })
    RecargaMessage({
      nombre_cliente: 'Juan Perez',
      monto: data.amount,
      id_cliente: '1234567890',
    }, '51914019629', isMobile ? 'mobile' : 'web')

    toast.success(
      `Recarga exitosa: $${data.amount}`,
      { duration: 2000 }
    )

    form.reset()
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
            <DialogDescription>
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
                            min={1}
                            max={monto}
                            step="any"
                            placeholder="0.00"
                            className="pr-12"
                            {...field}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
                            PEN
                          </div>
                        </div>
                        <span className='text-sm text-gray-500'>TC: {tasaConversion} -  {((field.value || 0) / tasaConversion).toFixed(2)} USD</span>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div className="space-y-8 text-center">
                  <Stepper defaultValue={2} orientation="vertical">
                    {steps.map(({ step, title, description }) => (
                      <StepperItem
                        key={step}
                        step={step}
                        className="relative items-start not-last:flex-1"
                      >
                        <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                          <StepperIndicator />
                          <div className="mt-0.5 space-y-0.5 px-2 text-left">
                            <StepperTitle>{title}</StepperTitle>
                            <StepperDescription>{description}</StepperDescription>
                          </div>
                        </StepperTrigger>
                        {step < steps.length && (
                          <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                        )}
                      </StepperItem>
                    ))}
                  </Stepper>

                  <p
                    className="text-muted-foreground flex gap-2 items-center mt-2 text-xs"
                    role="region"
                    aria-live="polite"
                  >
                    Para mas información, comunícate al
                    <a href="https://wa.me/51941442792" target="_blank" className='flex items-center gap-1 '>
                      <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-5' />
                      <span className='text-green-500'>
                        +51 941 442 792
                      </span>
                    </a>
                  </p>
                </div>
                <Card className='bg-white text-black' >
                  <CardHeader>
                    <CardTitle>Métodos de pago</CardTitle>
                  </CardHeader>
                  <CardContent className=" flex gap-8 justify-between">

                    <div className='flex flex-col items-center gap-2'>
                      <div className='flex items-center gap-2'>
                        <img src="https://images.seeklogo.com/logo-png/38/1/yape-logo-png_seeklogo-381640.png" alt="Yape" className="size-14 rounded-xl" />
                        <img src="https://images.seeklogo.com/logo-png/38/1/plin-logo-png_seeklogo-386806.png" alt="Plin" className="size-14" />
                      </div>
                      <p className="text-center font-bold">+51 941 442 792</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <img src="https://images.seeklogo.com/logo-png/32/1/binance-coin-bnb-logo-png_seeklogo-325081.png" alt="Binance" className="size-14 " />
                      <div className=''>

                        <p className="text-center font-bold">Binance</p>
                        <p className="text-center text-xs">ID: 1096171177</p>
                        <p className="text-center text-xs">Nombre: Maiky L.</p>
                        <p className="text-center text-xs">1 USDT = 3.5 soles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" >
                  Solicitar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
