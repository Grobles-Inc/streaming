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
import { useCreateCompra, useUpdateBilleteraProveedorSaldo } from '../../queries/compra'
import { useRemoveIdFromStockProductos, useStockProductosIds, useUpdateStockProductoStatusVendido } from '../../queries/productos'
import { Producto } from '../../services'
import { PhoneInput } from './phone-input'
import { useConfiguracionSistema } from '../../queries'
import { useNavigate } from '@tanstack/react-router'

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
  const { user } = useAuthStore()
  const productoId = producto?.id || 0
  const navigate = useNavigate()
  const { mutate: createCompra } = useCreateCompra()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '0')
  const { mutate: actualizarSaldo } = useUpdateBilleteraSaldo()
  const { data: configuracion } = useConfiguracionSistema()
  const { data: stockProductosIds } = useStockProductosIds(productoId)
  const { mutate: updateProveedorBilletera } = useUpdateBilleteraProveedorSaldo()
  const { mutate: removeIdFromStockProductos } = useRemoveIdFromStockProductos()
  const { mutate: updateStockProductoStatusVendido } = useUpdateStockProductoStatusVendido()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_cliente: '',
      telefono_cliente: '',
    },
  })

  if (!configuracion || !producto) return null

  const tasaDeConversion = configuracion?.conversion || 1
  const monto = billetera?.saldo
  const randomIndex = Math.floor(Math.random() * (stockProductosIds?.length || 0))
  const stock_producto_id = stockProductosIds?.[randomIndex] || 0
  const fecha_expiracion = new Date(Date.now() + producto.tiempo_uso * 24 * 60 * 60 * 1000).toISOString()
  const precio_producto = user ? producto.precio_vendedor : producto.precio_publico

  function onSubmit(data: FormData) {

    if (!user?.id) {
      toast.error("Debes iniciar sesión para comprar un producto", { duration: 3000 })
      return
    }
    if (user?.rol !== 'seller') {
      toast.error("Tu rol no permite comprar productos", { duration: 3000 })
      return
    }
    if (!precio_producto || !monto || !billetera?.id) return
    if (monto && monto < precio_producto) {
      toast.error("No tienes suficiente saldo", { duration: 3000 })
      return
    }
    if (!producto?.proveedor_id || !producto?.id) return
    createCompra({
      proveedor_id: producto.proveedor_id,
      producto_id: producto.id,
      vendedor_id: user.id,
      nombre_cliente: data.nombre_cliente,
      estado: producto.a_pedido ? 'pedido' : 'resuelto',
      precio: producto.precio_vendedor,
      monto_reembolso: producto.precio_vendedor,
      telefono_cliente: data.telefono_cliente.replace(/\s/g, ''),
      fecha_inicio: producto.a_pedido ? null : new Date().toISOString(),
      stock_producto_id: stock_producto_id,
      fecha_expiracion: producto.a_pedido ? null : fecha_expiracion,
    })
    actualizarSaldo(
      { id: billetera?.id, nuevoSaldo: monto - producto?.precio_vendedor },
      {
        onSuccess: () => {
          removeIdFromStockProductos(
            { productoId: producto.id },
            {
              onSuccess: () => {
                updateStockProductoStatusVendido({ id: stock_producto_id })
                updateProveedorBilletera({ idBilletera: producto.usuarios.billetera_id, precioProducto: producto?.precio_vendedor })
                navigate({ to: '/compras' })
              }
            }
          )
        }
      }
    )

    onOpenChange(false)
    form.reset()
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle className='flex items-center gap-4'>
            {producto.nombre}
          </DialogTitle>
          <DialogDescription>{producto.descripcion}</DialogDescription>

        </DialogHeader>
        <div className='flex justify-between'>
          <div className='flex items-center gap-4'>

            <img src={producto.imagen_url || ''} alt={producto.nombre} className='size-14 rounded' />
            <div className='flex flex-col gap-1'>


              <span className="font-bold text-2xl">$ {precio_producto.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">S/.{(precio_producto * tasaDeConversion).toFixed(2)} </span>
            </div>
          </div>
          {user && (
            <div className='flex flex-col items-end'>
              <span className="font-bold text-2xl">$ {monto?.toFixed(2)} </span>
              <span className="text-xs text-muted-foreground ">Saldo Actual</span>
            </div>
          )}
        </div>

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
          <div className="font-semibold mb-4">Tiempo de compra</div>
          <label
            className="flex-1 border rounded-lg p-4 cursor-not-allowed transition-colors border-primary bg-secondary flex items-start gap-3"
          >
            <input
              type="radio"
              name="plan"
              value={producto.tiempo_uso}
              checked={!!producto.tiempo_uso}
              className="accent-primary mt-1"
            />
            <div>
              <span className="font-semibold text-white dark:text-black">{producto.tiempo_uso} días</span>
              <div className="text-xs text-white/50 dark:text-black/50">Acceso por {producto.tiempo_uso} días.</div>
            </div>
          </label>

        </div>

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="nombre_cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres y Apellidos</FormLabel>
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} defaultCountry="PE" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={!form.formState.isValid} className="w-full">
                Comprar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
