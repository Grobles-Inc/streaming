import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Compra } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Compra
}

const formSchema = z.object({
  producto: z.string().min(1, 'Producto es requerido.'),
  email_cuenta: z.string().min(1, 'Email es requerido.'),
  clave_cuenta: z.string().min(1, 'Clave es requerida.'),
  url_cuenta: z.string().min(1, 'URL es requerida.'),
  perfil: z.string().min(1, 'Perfil es requerido.'),
  pin: z.string().min(1, 'Pin es requerido.'),
  fecha_inicio: z.string().min(1, 'Fecha de inicio es requerida.'),
  fecha_termino: z.string().min(1, 'Fecha de término es requerida.'),
  monto_reembolso: z.number().min(1, 'Monto de reembolso es requerido.'),
  nombre_cliente: z.string().min(1, 'Nombre del cliente es requerido.'),
  telefono_cliente: z.string().min(1, 'Teléfono del cliente es requerido.'),
  proveedor: z.string().min(1, 'Proveedor es requerido.'),
  dias_restantes: z.number().min(1, 'Días restantes es requerido.'),
})
type ComprasForm = z.infer<typeof formSchema>

export function ComprasMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<ComprasForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      producto: '',
      email_cuenta: '',
      clave_cuenta: '',
      url_cuenta: '',
      perfil: '',
      pin: '',
      fecha_inicio: '',
      fecha_termino: '',
      monto_reembolso: 0,
      nombre_cliente: '',
      telefono_cliente: '',
      proveedor: '',
      dias_restantes: 0,
    },
  })

  const onSubmit = (data: ComprasForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Actualizar' : 'Crear'} Compra</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Actualiza la compra proporcionando la información necesaria.'
              : 'Añade una nueva compra proporcionando la información necesaria.'}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='compras-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 px-4'
          >
            <FormField
              control={form.control}
              name='producto'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Producto</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ingrese un producto' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email_cuenta'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Email de la cuenta</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select dropdown'
                    items={[
                      { label: 'In Progress', value: 'in progress' },
                      { label: 'Backlog', value: 'backlog' },
                      { label: 'Todo', value: 'todo' },
                      { label: 'Canceled', value: 'canceled' },
                      { label: 'Done', value: 'done' },
                    ]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='clave_cuenta'
              render={({ field }) => (
                <FormItem className='relative space-y-3'>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='documentation' />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          Documentation
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='feature' />
                        </FormControl>
                        <FormLabel className='font-normal'>Feature</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='bug' />
                        </FormControl>
                        <FormLabel className='font-normal'>Bug</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='url_cuenta'
              render={({ field }) => (
                <FormItem className='relative space-y-3'>
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='high' />
                        </FormControl>
                        <FormLabel className='font-normal'>High</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='medium' />
                        </FormControl>
                        <FormLabel className='font-normal'>Medium</FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-y-0 space-x-3'>
                        <FormControl>
                          <RadioGroupItem value='low' />
                        </FormControl>
                        <FormLabel className='font-normal'>Low</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
