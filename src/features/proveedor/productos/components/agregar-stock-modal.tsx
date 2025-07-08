import { useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconTrash, IconPlus, IconPackage } from '@tabler/icons-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateStockProducto, useProductosByProveedor } from '../queries'
import { useAuth } from '@/stores/authStore'

// Schema básico sin validación compleja por ahora
const stockFormSchema = z.object({
  producto_id: z.number().min(1, 'Selecciona un producto'),
  tipo: z.enum(['cuenta', 'perfiles', 'combo']),
  email: z.string().optional(),
  clave: z.string().optional(), 
  url: z.string().optional(),
  perfil: z.string().optional(),
  pin: z.string().optional(),
  perfiles: z.array(z.object({
    email: z.string(),
    clave: z.string(),
    perfil: z.string().optional(),
    pin: z.string().optional(),
  })).optional(),
})

type StockFormData = z.infer<typeof stockFormSchema>

interface AgregarStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId?: number
}

export function AgregarStockModal({ 
  open, 
  onOpenChange, 
  productoId 
}: AgregarStockModalProps) {
  const { user } = useAuth()
  const { data: productos } = useProductosByProveedor(user?.id ?? '')
  const createStockMutation = useCreateStockProducto()

  // Obtener el producto específico si se pasa un productoId
  const productoSeleccionado = productoId ? productos?.find(p => p.id === productoId) : null

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors }
  } = useForm<StockFormData>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      producto_id: productoId || 0,
      tipo: 'cuenta',
      perfiles: [{ email: '', clave: '', perfil: '', pin: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'perfiles'
  })

  const tipoSeleccionado = watch('tipo')

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        producto_id: productoId || 0,
        tipo: 'cuenta',
        email: '',
        clave: '',
        url: '',
        perfil: '',
        pin: '',
        perfiles: [{ email: '', clave: '', perfil: '', pin: '' }]
      })
    }
  }, [open, productoId, reset])

  // Limpiar campos no necesarios cuando cambia el tipo
  useEffect(() => {
    if (tipoSeleccionado === 'perfiles') {
      // Limpiar campos individuales para perfiles
      setValue('email', '')
      setValue('clave', '')
      setValue('url', '')
      setValue('perfil', '')
      setValue('pin', '')
    } else {
      // Limpiar array de perfiles para cuenta/combo
      setValue('perfiles', [])
    }
  }, [tipoSeleccionado, setValue])

  const onSubmit = async (data: StockFormData) => {
    if (!user?.id) {
      return
    }

    // Validación manual según el tipo
    if (data.tipo === 'cuenta' || data.tipo === 'combo') {
      if (!data.email || data.email.trim() === '') {
        return
      }
      if (!data.clave || data.clave.trim() === '') {
        return
      }
    }
    
    if (data.tipo === 'perfiles') {
      if (!data.perfiles || data.perfiles.length === 0) {
        return
      }
      
      // Validar cada perfil
      for (let i = 0; i < data.perfiles.length; i++) {
        const perfil = data.perfiles[i]
        if (!perfil.email || perfil.email.trim() === '') {
          return
        }
        if (!perfil.clave || perfil.clave.trim() === '') {
          return
        }
      }
    }

    try {
      if (data.tipo === 'perfiles' && data.perfiles) {
        // Crear múltiples entradas para perfiles
        for (let i = 0; i < data.perfiles.length; i++) {
          const perfilData = data.perfiles[i]
          
          const stockData = {
            producto_id: data.producto_id,
            proveedor_id: user.id,
            tipo: 'perfiles' as const,
            email: perfilData.email,
            clave: perfilData.clave,
            perfil: perfilData.perfil || null,
            pin: perfilData.pin || null,
            url: null,
            estado: 'disponible' as const,
            publicado: false,
            soporte_stock_producto: 'activo' as const
          }
          
          await createStockMutation.mutateAsync(stockData)
        }
      } else {
        // Crear entrada única para cuenta o combo
        const stockData = {
          producto_id: data.producto_id,
          proveedor_id: user.id,
          tipo: data.tipo,
          email: data.email || null,
          clave: data.clave || null,
          url: data.url || null,
          perfil: data.perfil || null,
          pin: data.pin || null,
          estado: 'disponible' as const,
          publicado: false,
          soporte_stock_producto: 'activo' as const
        }
        
        await createStockMutation.mutateAsync(stockData)
      }

      // Cerrar modal y resetear formulario
      onOpenChange(false)
      reset()
      
    } catch (error) {
      // El error ya será mostrado por el toast del hook
    }
  }

  const agregarPerfil = () => {
    append({ email: '', clave: '', perfil: '', pin: '' })
  }

  const eliminarPerfil = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[70vw] !max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconPackage size={20} />
            Agregar Stock
          </DialogTitle>
          <DialogDescription>
            Agrega nuevas existencias a tus productos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Selector de Producto */}
          <div className="space-y-2">
            <Label htmlFor="producto_id">
              Producto <span className="text-red-500">*</span>
            </Label>
            {productoId ? (
              // Campo de solo lectura cuando se pasa un productoId específico
              <Input
                value={productoSeleccionado?.nombre || 'Cargando...'}
                readOnly
                className="bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Producto seleccionado"
              />
            ) : (
              // Select normal cuando no se pasa productoId
              <Select 
                value={watch('producto_id')?.toString()} 
                onValueChange={(value) => setValue('producto_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos?.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id.toString()}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.producto_id && (
              <p className="text-sm text-red-500">{errors.producto_id.message}</p>
            )}
          </div>

          {/* Selector de Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={tipoSeleccionado} 
              onValueChange={(value: 'cuenta' | 'perfiles' | 'combo') => setValue('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cuenta">CUENTA</SelectItem>
                <SelectItem value="perfiles">PERFILES</SelectItem>
                <SelectItem value="combo">COMBO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campos para tipo CUENTA */}
          {tipoSeleccionado === 'cuenta' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Cuenta Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clave">
                    Cuenta Clave <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('clave')}
                    type="password"
                    placeholder="Contraseña"
                  />
                  {errors.clave && (
                    <p className="text-sm text-red-500">{errors.clave.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Cuenta URL</Label>
                  <Input
                    {...register('url')}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfil">Perfil</Label>
                  <Input
                    {...register('perfil')}
                    placeholder="Nombre del perfil"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    {...register('pin')}
                    placeholder="PIN"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campos para tipo PERFILES */}
          {tipoSeleccionado === 'perfiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Cant. Perfiles: {fields.length}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={agregarPerfil}
                  className="text-red-500 border-red-500 hover:bg-red-50"
                >
                  <IconPlus size={16} className="mr-1" />
                  Agregar perfil
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground">
                  <div>Cuenta Email</div>
                  <div>Cuenta Clave</div>
                  <div>Perfil</div>
                  <div>PIN</div>
                  <div></div>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <Input
                        {...register(`perfiles.${index}.email`)}
                        placeholder="correo@ejemplo.com"
                      />
                      {errors.perfiles?.[index]?.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.perfiles[index]?.email?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        {...register(`perfiles.${index}.clave`)}
                        type="password"
                        placeholder="Contraseña"
                      />
                      {errors.perfiles?.[index]?.clave && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.perfiles[index]?.clave?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        {...register(`perfiles.${index}.perfil`)}
                        placeholder="Nombre perfil"
                      />
                    </div>
                    <div>
                      <Input
                        {...register(`perfiles.${index}.pin`)}
                        placeholder="PIN"
                      />
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarPerfil(index)}
                        disabled={fields.length === 1}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campos para tipo COMBO */}
          {tipoSeleccionado === 'combo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Principal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('email')}
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clave">
                    Clave Principal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register('clave')}
                    type="password"
                    placeholder="Contraseña"
                  />
                  {errors.clave && (
                    <p className="text-sm text-red-500">{errors.clave.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL del Combo</Label>
                  <Input
                    {...register('url')}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfil">Descripción</Label>
                  <Input
                    {...register('perfil')}
                    placeholder="Descripción del combo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN/Código</Label>
                  <Input
                    {...register('pin')}
                    placeholder="PIN o código"
                  />
                </div>
              </div>
            </div>
          )}



          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={createStockMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {createStockMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 