import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useBilleteraByUsuario, useUpdateBilleteraSaldo } from '@/queries'
import { useAuthStore } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Producto } from '../services'
import { useCreateCompra } from '../queries/compra'

const formSchema = z.object({
  nombre_cliente: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono_cliente: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
})

type FormData = z.infer<typeof formSchema>

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}

export default function ComprarProductoModal({ open, onOpenChange, producto }: ComprarProductoModalProps) {
  if (!producto) return null

  const { user } = useAuthStore()
  const { mutate: createCompra } = useCreateCompra()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '0')
  const { mutate: actualizarSaldo } = useUpdateBilleteraSaldo()
  const monto = billetera?.saldo
  const stock_producto_id = 1

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_cliente: '',
      telefono_cliente: '',
    },
  })

  function onSubmit(data: FormData) {
    if (!user?.id) {
      toast.error("Debes iniciar sesión para comprar un producto", { duration: 3000 })
      return
    }
    if (!producto?.precio || !monto || !billetera?.id) return
    if (monto && monto < producto?.precio) {
      toast.error("No tienes suficiente saldo", { duration: 3000 })
      return
    }

    createCompra({
      proveedor_id: producto.usuarios.id,
      producto_id: producto.id,
      vendedor_id: user.id,
      nombre_cliente: data.nombre_cliente,
      precio: producto.precio,
      telefono_cliente: data.telefono_cliente,
      stock_producto_id: stock_producto_id,
    })

    actualizarSaldo({ id: billetera?.id, nuevoSaldo: monto - producto?.precio })
    toast.success("Producto comprado correctamente", { duration: 3000 })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle>{producto.categorias.nombre.toUpperCase()}</DialogTitle>
          <DialogDescription>{producto.descripcion}</DialogDescription>

        </DialogHeader>
        <div className='flex justify-between'>
          <span className=" text-gray-500 font-semibold mb-1">Proveedor: {producto.usuarios.nombres}</span>
          <span className="font-bold text-2xl">${producto.precio.toFixed(2)}</span>
        </div>

        {/* Accordion for Product Information */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="detalles">
            <AccordionTrigger>Detalles del producto</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="informacion">
            <AccordionTrigger>Información adicional</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.informacion}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="condiciones">
            <AccordionTrigger>Condiciones de uso</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{producto.condiciones}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Plan Selector (Read-only) */}
        <div className="mb-4">
          <div className="font-semibold mb-1">Tiempo de compra</div>
          <div className="flex gap-4">
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.tiempo_uso === 30 ? 'border-primary bg-secondary' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="30"
                checked={producto.tiempo_uso === 30}
                disabled
                className="accent-primary mt-1"
              />
              <div>
                <span className="font-semibold text-base">30 días</span>
                <div className="text-xs text-muted-foreground">Acceso por 30 días.</div>
              </div>
            </label>
            <label
              className={`flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors ${producto.tiempo_uso === 1 ? 'border-primary bg-muted/30' : 'border-muted bg-transparent'} flex items-start gap-3`}
            >
              <input
                type="radio"
                name="plan"
                value="1"
                checked={producto.tiempo_uso === 1}
                disabled
                className="accent-primary mt-1"
              />
              <div>
                <span className="font-semibold text-base">1 día</span>
                <div className="text-xs text-muted-foreground">Acceso por 1 día.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="font-semibold">Información de compra</h3>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="nombre_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de teléfono</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Ingresa tu número de teléfono" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">
                Comprar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
