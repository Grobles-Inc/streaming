import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { createProductoSchema, type CreateProductoData } from '../data/schema'
import { useProductos } from '../hooks/use-productos'
import { ProductoImagenSelector } from './producto-imagen-selector'
import type { SupabaseProducto } from '../data/types'

interface ProductoFormProps {
  producto?: SupabaseProducto // Opcional para evitar errores
  onSuccess?: () => void
  onCancel?: () => void
}

interface Categoria {
  id: string
  nombre: string
}

// Datos de ejemplo - en una app real esto vendría de la base de datos
const categorias: Categoria[] = [
  { id: '1', nombre: 'Streaming' },
  { id: '2', nombre: 'Software' },
  { id: '3', nombre: 'Gaming' },
  { id: '4', nombre: 'VPN' },
  { id: '5', nombre: 'Cloud Storage' },
]

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const { actualizarProducto, loading } = useProductos()

  // No renderizar si no hay producto
  if (!producto) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No hay producto seleccionado para editar.</p>
      </div>
    )
  }

  const form = useForm<CreateProductoData>({
    resolver: zodResolver(createProductoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      informacion: '',
      condiciones: '',
      precio_publico: 0,
      stock: 0,
      categoria_id: '',
      proveedor_id: '',
      imagen_url: '',
      tiempo_uso: 30,
      a_pedido: false,
      nuevo: false,
      descripcion_completa: '',
      disponibilidad: 'en_stock',
      renovable: false,
      solicitud: '',
      muestra_disponibilidad_stock: true,
      deshabilitar_boton_comprar: false,
      precio_vendedor: 0,
      precio_renovacion: null,
      estado: 'borrador',
    },
  })

  // Effect para cargar los datos del producto
  useEffect(() => {
    const formData = {
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      informacion: producto.informacion || '',
      condiciones: producto.condiciones || '',
      precio_publico: producto.precio_publico || 0,
      stock: producto.stock || 0,
      categoria_id: producto.categoria_id || '',
      proveedor_id: producto.proveedor_id || '', // Mantener el proveedor original
      imagen_url: producto.imagen_url || '',
      tiempo_uso: producto.tiempo_uso || 30,
      a_pedido: producto.a_pedido || false,
      nuevo: producto.nuevo || false,
      descripcion_completa: producto.descripcion_completa || '',
      disponibilidad: producto.disponibilidad || 'en_stock',
      renovable: producto.renovable || false,
      solicitud: producto.solicitud || '',
      muestra_disponibilidad_stock: producto.muestra_disponibilidad_stock ?? true,
      deshabilitar_boton_comprar: producto.deshabilitar_boton_comprar || false,
      precio_vendedor: producto.precio_vendedor || 0,
      precio_renovacion: producto.precio_renovacion || null,
      estado: producto.estado || 'borrador',
    }
    
    // Resetear el formulario con los datos del producto
    form.reset(formData)
  }, [producto, form])

  const onSubmit = async (data: CreateProductoData) => {
    try {
      await actualizarProducto(producto.id, data)
      onSuccess?.()
    } catch (error) {
      console.error('Error al actualizar producto:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Netflix Premium" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción corta</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción breve del producto..." 
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
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
                      <Textarea 
                        placeholder="Descripción detallada del producto..." 
                        rows={5}
                        {...field}
                        value={field.value || ''}
                      />
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
                    <FormLabel>Categoría *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Precios y stock */}
          <Card>
            <CardHeader>
              <CardTitle>Precios y stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="precio_publico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio público *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precio_vendedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio vendedor *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
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
                    <FormLabel>Stock inicial</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
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
                      <Input 
                        type="number" 
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                      />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </CardContent>
          </Card>

          {/* Imagen */}
          <Card>
            <CardHeader>
              <CardTitle>Imagen del producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="imagen_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ProductoImagenSelector
                        imagenSeleccionada={field.value || ''}
                        onImagenSeleccionada={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="publicado">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="a_pedido"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>A pedido</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nuevo"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Producto nuevo</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="renovable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Renovable</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="muestra_disponibilidad_stock"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Mostrar disponibilidad de stock</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deshabilitar_boton_comprar"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Deshabilitar botón comprar</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="informacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Información del producto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información adicional sobre el producto..." 
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
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
                  <FormLabel>Condiciones</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Condiciones de uso del producto..." 
                      rows={4}
                      {...field}
                      value={field.value || ''}
                    />
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
                  <FormLabel>Información de solicitud</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Información necesaria para procesar la solicitud..." 
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {producto ? 'Actualizar producto' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
