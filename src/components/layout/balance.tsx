import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ChevronsUpDown, Minus, Plus as PlusIcon, Wallet } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { SidebarMenuButton, useSidebar } from '../ui/sidebar'
import { DesembolsoMessage, RecargaMessage } from '@/lib/whatsapp'
import { useBilleteraByUsuario, useUpdateBilleteraSaldo } from '@/queries'
import { useAuthStore } from '@/stores/authStore'

type OperacionSaldo = 'recargar' | 'retirar'

export function Balance() {
  const { isMobile } = useSidebar()
  const { user } = useAuthStore()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [operacion, setOperacion] = React.useState<OperacionSaldo>('recargar')
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

    // Validar saldo suficiente para retiro
    if (operacion === 'retirar' && data.amount > monto) {
      toast.error("No tienes suficiente saldo", { duration: 3000 })
      return
    }

    // Actualizar saldo según la operación
    const nuevoMonto = operacion === 'recargar'
      ? monto + data.amount
      : monto - data.amount

    actualizarSaldo({ id: billetera?.id || '', nuevoSaldo: nuevoMonto })

    // Enviar mensaje solo para recargas
    if (operacion === 'recargar') {
      RecargaMessage({
        nombre_cliente: 'Juan Perez',
        monto: data.amount,
        metodo: 'Yape',
        id_cliente: '1234567890',
      }, '51914019629', isMobile ? 'mobile' : 'web')
    } else {
      DesembolsoMessage({
        nombre_cliente: 'Juan Perez',
        monto: data.amount,
        metodo: 'Yape',
        id_cliente: '1234567890',
      }, '51914019629', isMobile ? 'mobile' : 'web')
    }

    toast.success(
      operacion === 'recargar'
        ? `Recarga exitosa: $${data.amount}`
        : `Retiro exitoso: $${data.amount}`,
      { duration: 2000 }
    )

    form.reset()
  }

  function handleOperacionClick(tipo: OperacionSaldo) {
    setOperacion(tipo)
    setDialogOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size='lg'
            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
          >
            <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
              <Wallet className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold text-lg'>
                $ {monto.toFixed(2)}
              </span>
              <span className='truncate text-xs'>Saldo Actual</span>
            </div>
            <ChevronsUpDown className='ml-auto' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
          align='start'
          side={isMobile ? 'bottom' : 'right'}
          sideOffset={4}
        >
          <DropdownMenuLabel className='text-muted-foreground text-xs'>
            Acciones
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleOperacionClick('recargar')}>
            <div className='flex size-6 items-center justify-center rounded-sm border'>
              <PlusIcon className="w-4 h-4" />
            </div>
            Recargar Saldo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOperacionClick('retirar')}>
            <div className='flex size-6 items-center justify-center rounded-sm border'>
              <Minus className="w-4 h-4" />
            </div>
            Retirar Saldo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  max: operacion === 'retirar'
                    ? { value: monto, message: 'No puedes retirar más de tu saldo actual' }
                    : undefined
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={operacion === 'retirar' ? monto : undefined}
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
    </>
  )
}
