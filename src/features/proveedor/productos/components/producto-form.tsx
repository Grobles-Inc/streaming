import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useCategorias, useCreateProducto, useUpdateProducto } from '../queries'
import { productoSchema, type ProductoFormData } from '../data/schema'
import { Categoria } from '../services'
import { useAuth } from '@/stores/authStore'

interface ProductoFormDialogProps {
  trigger: React.ReactNode
  defaultValues?: Partial<ProductoFormData>
  title?: string
  description?: string
  productId?: string // Para edición
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProductoFormDialog({
  trigger,
  defaultValues,
  title = 'Nuevo Producto',
  description = 'Completa la información para agregar un nuevo producto.',
  productId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProductoFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Usar estado controlado si se proporciona, sino usar estado interno
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias()
  const { mutate: createProducto, isPending: isCreating } = useCreateProducto()
  const { mutate: updateProducto, isPending: isUpdating } = useUpdateProducto()
  const { user } = useAuth()
  
  const isPending = isCreating || isUpdating
  const isEditing = !!productId
  
  const form = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      imagen_url: '',
      renovable: false,
      disponibilidad: 'en_stock',
      descripcion: '',
      descripcion_completa: '',
      categoria_id: '',
      condiciones: '',
      informacion: '',
      solicitud: '',
      precio_vendedor: 0,
      precio_publico: 0,
      precio_renovacion: 0,
      stock: 0,
      deshabilitar_boton_comprar: false,
      muestra_disponibilidad_stock: false,
      url_cuenta: '',
      tiempo_uso: 0,
      a_pedido: false,
      nuevo: false,
      destacado: false,
      mas_vendido: false,
      ...defaultValues,
    },
  })


  const handleSubmit = async (data: ProductoFormData) => {
    if (isEditing) {
      updateProducto({
        id: productId,
        updates: data
      }, {
        onSuccess: () => {
          form.reset()
          setOpen(false)
        }
      })
    } else {
      createProducto({
        ...data,
        proveedor_id: user?.id ?? '',
        stock_de_productos: []
      }, {
        onSuccess: () => {
          form.reset()
          setOpen(false)
        }
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              {/* Columna 1 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del producto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imagen_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoria_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={loadingCategorias}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((cat: Categoria) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disponibilidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disponibilidad</FormLabel>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona disponibilidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en_stock">En stock</SelectItem>
                          <SelectItem value="a_pedido">A pedido</SelectItem>
                          <SelectItem value="activacion">Activación</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precio_vendedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio vendedor</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min={0} placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precio_publico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio público</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min={0} placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="precio_renovacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio renovación</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" min={0} placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url_cuenta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de cuenta</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tiempo_uso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo de uso (días)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Columna 2 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción corta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción corta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descripcion_completa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción completa</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descripción completa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condiciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condiciones de uso</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Condiciones de uso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="informacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Información de producto</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Información adicional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="solicitud"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detalle solicitud</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detalle de solicitud" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Switches y campos adicionales en varias filas */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="renovable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Es renovable?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="a_pedido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿A pedido?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nuevo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Es nuevo?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="destacado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Destacado?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mas_vendido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>¿Más vendido?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deshabilitar_boton_comprar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deshabilitar botón comprar</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="muestra_disponibilidad_stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Muestra disponibilidad stock</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending 
                    ? (isEditing ? 'Actualizando...' : 'Agregando...') 
                    : (isEditing ? 'Actualizar producto' : 'Agregar producto')
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
