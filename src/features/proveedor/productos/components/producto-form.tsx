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
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, LoaderIcon } from "lucide-react"
import { useFileUpload } from "@/hooks/use-file-upload"
import { SupabaseStorageService } from '@/lib/supabase'

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
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Usar estado controlado si se proporciona, sino usar estado interno
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen
  const { data: categorias = [], isLoading: loadingCategorias } = useCategorias()
  const { mutate: createProducto, isPending: isCreating } = useCreateProducto()
  const { mutate: updateProducto, isPending: isUpdating } = useUpdateProducto()
  const { user } = useAuth()

  const isPending = isCreating || isUpdating
  const isEditing = !!productId

  const maxSizeMB = 2
  const maxSize = maxSizeMB * 1024 * 1024 // 2MB default

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
      clearFiles,
    },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
  })
  const previewUrl = files[0]?.preview || null

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
      tiempo_uso: 0,
      a_pedido: false,
      nuevo: false,
      destacado: false,
      mas_vendido: false,
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: ProductoFormData) => {
    if (!user) {
      console.error('❌ ProductoForm: No hay usuario autenticado')
      return
    }

    let imageUrl = data.imagen_url || ''

    // Si hay un archivo seleccionado, subirlo a Supabase Storage
    if (files[0]?.file instanceof File) {
      setIsUploadingImage(true)
      try {
        imageUrl = await SupabaseStorageService.uploadProductImage(files[0].file, user.id)
        console.log('✅ Imagen subida exitosamente:', imageUrl)
      } catch (error) {
        console.error('❌ Error al subir imagen:', error)
        setIsUploadingImage(false)
        return
      }
      setIsUploadingImage(false)
    }

    const productoData = {
      ...data,
      imagen_url: imageUrl,
    }

    if (isEditing) {
      updateProducto({
        id: productId,
        updates: productoData
      }, {
        onSuccess: (result) => {
          console.log('ProductoForm - Producto actualizado exitosamente:', result)
          form.reset()
          clearFiles()
          setOpen(false)
        },
        onError: (error) => {
          console.error('ProductoForm - Error al actualizar:', error)
        }
      })
    } else {
      const finalProductoData = {
        ...productoData,
        proveedor_id: user.id,
        stock_de_productos: [],
      }

      createProducto(finalProductoData, {
        onSuccess: (result) => {
          console.log('✅ ProductoForm - Producto creado exitosamente:', result)
          form.reset()
          clearFiles()
          setOpen(false)
        },
        onError: (error) => {
          console.error('❌ ProductoForm - Error al crear:', error)
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
                      <FormLabel>Imagen del Producto</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            {/* Drop area */}
                            <div
                              onDragEnter={handleDragEnter}
                              onDragLeave={handleDragLeave}
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              data-dragging={isDragging || undefined}
                              className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                            >
                              <input
                                {...getInputProps()}
                                className="sr-only"
                                aria-label="Upload image file"
                              />
                              {previewUrl ? (
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                  <img
                                    src={previewUrl}
                                    alt={files[0]?.file?.name || "Uploaded image"}
                                    className="mx-auto max-h-full rounded object-contain"
                                  />
                                </div>
                              ) : field.value ? (
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                  <img
                                    src={field.value}
                                    alt="Imagen del producto"
                                    className="mx-auto max-h-full rounded object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                  <div
                                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                    aria-hidden="true"
                                  >
                                    <ImageIcon className="size-4 opacity-60" />
                                  </div>
                                  <p className="mb-1.5 text-sm font-medium">Arrastre su imagen aquí</p>
                                  <p className="text-muted-foreground text-xs">
                                    SVG, PNG, JPG o GIF (max. {maxSizeMB}MB)
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-4"
                                    onClick={openFileDialog}
                                  >
                                    <UploadIcon
                                      className="-ms-1 size-4 opacity-60"
                                      aria-hidden="true"
                                    />
                                    Seleccionar imagen
                                  </Button>
                                </div>
                              )}
                            </div>

                            {(previewUrl || field.value) && (
                              <div className="absolute top-4 right-4">
                                <button
                                  type="button"
                                  className="focus-visible:border-ring focus-visible:ring-ring/50 z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                                  onClick={() => {
                                    if (files[0]?.id) {
                                      removeFile(files[0].id)
                                    }
                                    field.onChange('')
                                  }}
                                  aria-label="Remove image"
                                >
                                  <XIcon className="size-4" aria-hidden="true" />
                                </button>
                              </div>
                            )}
                          </div>

                          {errors.length > 0 && (
                            <div
                              className="text-destructive flex items-center gap-1 text-xs"
                              role="alert"
                            >
                              <AlertCircleIcon className="size-3 shrink-0" />
                              <span>{errors[0]}</span>
                            </div>
                          )}
                        </div>
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

                {/* Switches en la columna derecha para aprovechar el espacio */}
                <div className="pt-4 space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Configuración del Producto</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="renovable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">¿Es renovable?</FormLabel>
                            <div className="text-xs text-muted-foreground">El producto puede ser renovado</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="a_pedido"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">¿A pedido?</FormLabel>
                            <div className="text-xs text-muted-foreground">Producto disponible bajo pedido</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nuevo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">¿Es nuevo?</FormLabel>
                            <div className="text-xs text-muted-foreground">Marcar como producto nuevo</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destacado"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">¿Destacado?</FormLabel>
                            <div className="text-xs text-muted-foreground">Mostrar en productos destacados</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mas_vendido"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">¿Más vendido?</FormLabel>
                            <div className="text-xs text-muted-foreground">Mostrar en más vendidos</div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Campos adicionales que ocupan toda la fila */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-sm font-medium text-foreground">Configuración Avanzada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="deshabilitar_boton_comprar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Deshabilitar botón comprar</FormLabel>
                          <div className="text-xs text-muted-foreground">El botón de compra estará deshabilitado</div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="muestra_disponibilidad_stock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-medium">Muestra disponibilidad stock</FormLabel>
                          <div className="text-xs text-muted-foreground">Mostrar información de stock público</div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
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
