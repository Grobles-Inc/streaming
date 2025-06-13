import * as React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronsUpDown, Wallet, Plus as PlusIcon } from 'lucide-react'
import { SidebarMenuButton, useSidebar } from '../ui/sidebar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function Balance({ balance }: { balance: number }) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const form = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  })

  function onSubmit(data: { amount: number }) {
    setDialogOpen(false)
    toast.success(`Saldo recargado correctamente: $${data.amount}`, { duration: 2000 })
    form.reset()
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
                $ {balance.toFixed(2)}
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
          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}

          >
            <div className='flex size-6 items-center justify-center rounded-sm border'>
              <PlusIcon className="w-4 h-4" />
            </div>
            Recargar Saldo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recargar saldo</DialogTitle>
            <DialogDescription>Ingresa el monto que deseas recargar.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{ required: 'El monto es requerido', min: { value: 1, message: 'Debe ser mayor a 0' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step="any" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Recargar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
