import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useBilleteraByUsuario } from '@/queries'
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
import { DEFAULT_CONVERSION } from '@/lib/conversion'
import { useRegistrarCompra } from '../../queries/compra'
import { useStockProductosIds } from '../../queries/productos'
import { Producto } from '../../services'
import { PhoneInput } from '@/components/phone-input'

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
  const { mutate: registrarCompra, isPending: isRegisteringCompra } =
    useRegistrarCompra()
  const { data: billetera } = useBilleteraByUsuario(user?.id || '0')
  const { data: configuracion } = useConfiguracionSistema()
  const { data: stockProductosIds } = useStockProductosIds(productoId)

  // Una key por apertura del modal. Si el submit falla, se reutiliza para que
  // el reintento sea idempotente; si el modal se cierra/abre, se renueva.
  const idempotencyKey = useRef<string>(crypto.randomUUID())

  useEffect(() => {
    if (open) idempotencyKey.current = crypto.randomUUID()
  }, [open])

  const isProcessing = isRegisteringCompra

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre_cliente: '',
      telefono_cliente: '',
    },
  })

  if (!configuracion || !producto) return null

  const tasaDeConversion = configuracion?.conversion ?? DEFAULT_CONVERSION
  const monto = billetera?.saldo
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
    if (monto < precio_producto) {
      toast.error('No tienes suficiente saldo', { duration: 3000 })
      return
    }
    if (!producto?.proveedor_id || !producto?.id) return
    if (!stockProductosIds || stockProductosIds.length === 0) {
      toast.error('No hay stock disponible', { duration: 3000 })
      return
    }

    // El servidor elige la cuenta disponible (SKIP LOCKED) y hace todo en una
    // sola transacción. No mandamos stock_producto_id para no usar un id de
    // una lista cacheada que otra compra pudo tomar.
    registrarCompra(
      {
        p_vendedor_id: user.id,
        p_producto_id: producto.id,
        p_nombre_cliente: data.nombre_cliente,
        p_telefono_cliente: data.telefono_cliente.replace(/\s/g, ''),
        p_idempotency_key: idempotencyKey.current,
      },
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
          navigate({ to: '/compras' })
        },
        // onError: `useRegistrarCompra` ya muestra el toast. Mantenemos la
        // misma idempotency key para que el reintento no cobre dos veces.
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
