import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useBilleteraByUsuario, useUpdateBilleteraSaldo } from '@/queries'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { useImageProxy } from '@/hooks/use-image-proxy'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useConfiguracionSistema } from '../../queries'
import {
  useCreateCompra,
  useUpdateBilleteraProveedorSaldo,
} from '../../queries/compra'
import {
  useRemoveStockIdFromProducto,
  useStockProductosIds,
  useUpdateStockProductoStatusVendido,
} from '../../queries/productos'
import { Producto } from '../../services'
import { PhoneInput } from './phone-input'
import { obtenerFechaInicioLima } from '@/features/proveedor/pedidos/utils/fecha-utils'

const formSchema = z.object({
  nombre_cliente: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono_cliente: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos'),
})

type FormData = z.infer<typeof formSchema>

type ComprarProductoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
}

export default function ComprarProductoModal({
  open,
  onOpenChange,
  producto,
}: ComprarProductoModalProps) {
  const { user } = useAuthStore()
  const { getProxiedImageUrl } = useImageProxy()
  const productoId = producto?.id || 0
  const navigate = useNavigate()
  const { mutate: createCompra, isPending: isCreatingCompra } =
    useCreateCompra()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '0')
  const { mutate: actualizarSaldo, isPending: isUpdatingSaldo } =
    useUpdateBilleteraSaldo()
  const { data: configuracion } = useConfiguracionSistema()
  const { data: stockProductosIds } = useStockProductosIds(productoId)
  const {
    mutate: updateProveedorBilletera,
    isPending: isUpdatingProveedorBilletera,
  } = useUpdateBilleteraProveedorSaldo()
  const {
    mutate: updateStockProductoStatusVendido,
    isPending: isUpdatingStockStatus,
  } = useUpdateStockProductoStatusVendido()
  const { mutate: removeStockIdFromProducto, isPending: isRemovingStock } =
    useRemoveStockIdFromProducto()

  const isProcessing =
    isCreatingCompra ||
    isUpdatingSaldo ||
    isUpdatingStockStatus ||
    isUpdatingProveedorBilletera ||
    isRemovingStock

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
  const fecha_expiracion = new Date(
    Date.now() + producto.tiempo_uso * 24 * 60 * 60 * 1000
  ).toISOString()
  const precio_producto = user
    ? producto.precio_vendedor
    : producto.precio_publico

  function onSubmit(data: FormData) {
    // Prevent concurrent submissions
    if (isProcessing) {
      return
    }

    if (!user?.id) {
      toast.error('Debes iniciar sesión para comprar un producto', {
        duration: 3000,
      })
      return
    }
    if (user?.rol !== 'seller') {
      toast.error('Tu rol no permite comprar productos', { duration: 3000 })
      return
    }
    if (!precio_producto || !monto || !billetera?.id) return
    if (monto && monto < precio_producto) {
      toast.error('No tienes suficiente saldo', { duration: 3000 })
      return
    }
    if (!producto?.proveedor_id || !producto?.id) return
    if (!stockProductosIds?.[0] || stockProductosIds.length === 0) {
      toast.error('No hay stock disponible', { duration: 3000 })
      return
    }

    // Chain mutations sequentially: createCompra -> actualizarSaldo -> updateStockProductoStatusVendido -> updateProveedorBilletera -> removeStockIdFromProducto
    createCompra(
      {
        proveedor_id: producto.proveedor_id,
        producto_id: producto.id,
        vendedor_id: user.id,
        nombre_cliente: data.nombre_cliente,
        estado:
          producto.disponibilidad === 'a_pedido' ||
          producto.disponibilidad === 'activacion'
            ? 'pedido'
            : 'resuelto',
        precio: producto.precio_vendedor,
        monto_reembolso: producto.precio_vendedor,
        telefono_cliente: data.telefono_cliente.replace(/\s/g, ''),
        fecha_inicio: obtenerFechaInicioLima(),
        stock_producto_id: stockProductosIds?.[0],
        fecha_expiracion: fecha_expiracion,
      },
      {
        onSuccess: () => {
          actualizarSaldo(
            {
              id: billetera?.id,
              nuevoSaldo: monto - producto?.precio_vendedor,
            },
            {
              onSuccess: () => {
                updateStockProductoStatusVendido(
                  { id: stockProductosIds?.[0], productoId: productoId },
                  {
                    onSuccess: () => {
                      updateProveedorBilletera(
                        {
                          idBilletera: producto.usuarios.billetera_id,
                          precioProducto: producto?.precio_vendedor,
                        },
                        {
                          onSuccess: () => {
                            removeStockIdFromProducto(
                              {
                                productoId: productoId,
                                stockProductoId: stockProductosIds?.[0],
                              },
                              {
                                onSuccess: () => {
                                  // Only close modal and navigate after all operations complete successfully
                                  onOpenChange(false)
                                  form.reset()
                                  navigate({ to: '/compras' })
                                },
                                onError: () => {
                                  toast.error(
                                    'Error al actualizar el stock del producto'
                                  )
                                },
                              }
                            )
                          },
                          onError: () => {
                            toast.error(
                              'Error al actualizar la billetera del proveedor'
                            )
                          },
                        }
                      )
                    },
                    onError: () => {
                      toast.error('Error al actualizar el estado del stock')
                    },
                  }
                )
              },
              onError: () => {
                toast.error('Error al actualizar el saldo')
              },
            }
          )
        },
        onError: () => {
          // Error handling is already done in useCreateCompra hook
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full max-w-md'>
        <DialogHeader className='flex flex-col gap-3'>
          <DialogTitle className='flex items-center gap-4'>
            {producto.nombre}
          </DialogTitle>
          <DialogDescription>{producto.descripcion}</DialogDescription>
        </DialogHeader>
        <div className='flex justify-between'>
          <div className='flex items-center gap-4'>
            <img
              src={getProxiedImageUrl(producto.imagen_url)}
              alt={producto.nombre}
              className='size-14 rounded'
            />
            <div className='flex flex-col gap-1'>
              <span className='text-2xl font-bold'>
                $ {precio_producto.toFixed(2)}
              </span>
              <span className='text-muted-foreground text-xs'>
                S/.{(precio_producto * tasaDeConversion).toFixed(2)}{' '}
              </span>
            </div>
          </div>
          {user && (
            <div className='flex flex-col items-end'>
              <span className='text-2xl font-bold'>$ {monto?.toFixed(2)} </span>
              <span className='text-muted-foreground text-xs'>
                Saldo Actual
              </span>
            </div>
          )}
        </div>

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='detalles'>
            <AccordionTrigger>Detalles del producto</AccordionTrigger>
            <AccordionContent>
              <p className='text-muted-foreground text-sm'>
                {producto.descripcion}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='informacion'>
            <AccordionTrigger>Información adicional</AccordionTrigger>
            <AccordionContent>
              <p className='text-muted-foreground text-sm'>
                {producto.informacion}
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='condiciones'>
            <AccordionTrigger>Condiciones de uso</AccordionTrigger>
            <AccordionContent>
              <p className='text-muted-foreground text-sm'>
                {producto.condiciones}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Plan Selector (Read-only) */}
        <div className='mb-4'>
          <div className='mb-4 font-semibold'>Tiempo de compra</div>
          <label className='border-primary bg-secondary flex flex-1 cursor-not-allowed items-start gap-3 rounded-lg border p-4 transition-colors'>
            <input
              type='radio'
              name='plan'
              value={producto.tiempo_uso}
              checked={!!producto.tiempo_uso}
              className='accent-primary mt-1'
            />
            <div>
              <span className='font-semibold text-white dark:text-black'>
                {producto.tiempo_uso} días
              </span>
              <div className='text-xs text-white/50 dark:text-black/50'>
                Acceso por {producto.tiempo_uso} días.
              </div>
            </div>
          </label>
        </div>

        {/* Form Section */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-3'>
              <FormField
                control={form.control}
                name='nombre_cliente'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder='Ingresa nombre' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='telefono_cliente'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} defaultCountry='PE' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type='submit'
                disabled={!form.formState.isValid || isProcessing}
                className='w-full'
              >
                {isProcessing ? 'Procesando...' : 'Comprar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
