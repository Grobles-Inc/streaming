import { useEffect, useRef, useState } from 'react'
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
import { IconTrash, IconPlus, IconPackage, IconCopy, IconClipboard, IconEye, IconEyeOff } from '@tabler/icons-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateStockProducto, useProductosByProveedor, useStockProductosByProductoId } from '../../productos/queries'
import { useAuth } from '@/stores/authStore'

// Schema básico con campos opcionales
const stockFormSchema = z.object({
  producto_id: z.number().min(1, 'Selecciona un producto'),
  tipo: z.enum(['cuenta', 'perfiles', 'combo']),
  email: z.string().optional(),
  clave: z.string().optional(), 
  url: z.string().optional(),
  perfil: z.string().optional(),
  pin: z.string().optional(),
  perfiles: z.array(z.object({
    email: z.string().optional(),
    clave: z.string().optional(),
    url: z.string().optional(),
    perfil: z.string().optional(),
    pin: z.string().optional(),
  })).optional(),
})

type StockFormData = z.infer<typeof stockFormSchema>

interface AgregarStockStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgregarStockStockModal({ 
  open, 
  onOpenChange
}: AgregarStockStockModalProps) {
  const { user } = useAuth()
  const { data: productos } = useProductosByProveedor(user?.id ?? '')
  const createStockMutation = useCreateStockProducto()

  // Estado para almacenar datos copiados
  const perfilCopiado = useRef<{
    email: string
    clave: string
    url: string
    perfil: string
    pin: string
  } | null>(null)

  // Estado para controlar visibilidad de contraseñas
  const [mostrarClave, setMostrarClave] = useState(false)
  const [mostrarClavePerfiles, setMostrarClavePerfiles] = useState<{ [key: number]: boolean }>({})

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
      producto_id: 0,
      tipo: 'cuenta',
      perfiles: [{ email: '', clave: '', url: '', perfil: '', pin: '' }]
    }
  })

  // Obtener el ID del producto seleccionado para consultar stock existente
  const productoIdSeleccionado = watch('producto_id')
  
  // Obtener stock existente para determinar si el tipo debe estar bloqueado
  const { data: stockExistente } = useStockProductosByProductoId(
    productoIdSeleccionado && productoIdSeleccionado > 0 ? productoIdSeleccionado : 0
  )
  
  // Determinar si ya existe stock y cuál es el tipo
  const tipoExistente = stockExistente && stockExistente.length > 0 ? stockExistente[0].tipo : null
  const debeBloquearTipo = Boolean(stockExistente && stockExistente.length > 0)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'perfiles'
  })

  const tipoSeleccionado = watch('tipo')

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        producto_id: 0,
        tipo: 'cuenta',
        email: '',
        clave: '',
        url: '',
        perfil: '',
        pin: '',
        perfiles: [{ email: '', clave: '', url: '', perfil: '', pin: '' }]
      })
    }
  }, [open, reset])

  // Actualizar tipo cuando se selecciona un producto con stock existente
  useEffect(() => {
    if (tipoExistente && productoIdSeleccionado > 0) {
      setValue('tipo', tipoExistente as 'cuenta' | 'perfiles' | 'combo')
    }
  }, [tipoExistente, productoIdSeleccionado, setValue])

  // Limpiar campos no necesarios cuando cambia el tipo
  useEffect(() => {
    if (tipoSeleccionado === 'perfiles') {
      // Limpiar campos individuales para perfiles
      setValue('email', '')
      setValue('clave', '')
      setValue('url', '')
      setValue('perfil', '')
      setValue('pin', '')
      setValue('perfiles', [{ email: '', clave: '', url: '', perfil: '', pin: '' }])
    } else {
      // Limpiar array de perfiles para cuenta/combo
      setValue('perfiles', [])
    }
  }, [tipoSeleccionado, setValue])

  const onSubmit = async (data: StockFormData) => {
    if (!user?.id) {
      return
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
            email: perfilData.email || null,
            clave: perfilData.clave || null,
            url: perfilData.url || null,
            perfil: perfilData.perfil || null,
            pin: perfilData.pin || null,
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
    append({ email: '', clave: '', url: '', perfil: '', pin: '' })
  }

  const eliminarPerfil = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const copiarPerfil = (index: number) => {
    const perfil = watch(`perfiles.${index}`)
    if (perfil) {
      perfilCopiado.current = {
        email: perfil.email || '',
        clave: perfil.clave || '',
        url: perfil.url || '',
        perfil: perfil.perfil || '',
        pin: perfil.pin || ''
      }
    }
  }

  const pegarPerfil = (index: number) => {
    if (perfilCopiado.current) {
      setValue(`perfiles.${index}.email`, perfilCopiado.current.email)
      setValue(`perfiles.${index}.clave`, perfilCopiado.current.clave)
      setValue(`perfiles.${index}.url`, perfilCopiado.current.url)
      setValue(`perfiles.${index}.perfil`, perfilCopiado.current.perfil)
      setValue(`perfiles.${index}.pin`, perfilCopiado.current.pin)
    }
  }

  const toggleMostrarClavePerfiles = (index: number) => {
    setMostrarClavePerfiles(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
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
            <Select 
              value={productoIdSeleccionado > 0 ? productoIdSeleccionado.toString() : ""} 
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
            {errors.producto_id && (
              <p className="text-sm text-red-500">{errors.producto_id.message}</p>
            )}
          </div>

          {/* Selector de Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-red-500">*</span>
              {debeBloquearTipo && (
                <span className="text-sm text-muted-foreground ml-2">
                  (Bloqueado - Este producto ya tiene stock de tipo {tipoExistente?.toUpperCase()})
                </span>
              )}
            </Label>
            <Select 
              value={tipoSeleccionado} 
              onValueChange={(value: 'cuenta' | 'perfiles' | 'combo') => setValue('tipo', value)}
              disabled={debeBloquearTipo}
            >
              <SelectTrigger className={debeBloquearTipo ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}>
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
                    Cuenta Email
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
                    Cuenta Clave
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('clave')}
                      type={mostrarClave ? "text" : "password"}
                      placeholder="Contraseña"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setMostrarClave(!mostrarClave)}
                    >
                      {mostrarClave ? (
                        <IconEyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <IconEye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
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
                <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground">
                  <div>Cuenta Email</div>
                  <div>Cuenta Clave</div>
                  <div>URL</div>
                  <div>Perfil</div>
                  <div>PIN</div>
                  <div>Acciones</div>
                  <div></div>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-7 gap-2 items-end">
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
                      <div className="relative">
                        <Input
                          {...register(`perfiles.${index}.clave`)}
                          type={mostrarClavePerfiles[index] ? "text" : "password"}
                          placeholder="Contraseña"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => toggleMostrarClavePerfiles(index)}
                        >
                          {mostrarClavePerfiles[index] ? (
                            <IconEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <IconEye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.perfiles?.[index]?.clave && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.perfiles[index]?.clave?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        {...register(`perfiles.${index}.url`)}
                        placeholder="https://..."
                      />
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
                    <div className="flex gap-1">
                      {(() => {
                        // Verificar si el perfil actual tiene datos para copiar
                        const perfilActual = watch(`perfiles.${index}`)
                        const tienesDatosParaCopiar = perfilActual && (
                          perfilActual.email?.trim() || 
                          perfilActual.clave?.trim() || 
                          perfilActual.url?.trim() || 
                          perfilActual.perfil?.trim() || 
                          perfilActual.pin?.trim()
                        )
                        
                        return (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarPerfil(index)}
                            className={`h-8 w-8 p-0 ${
                              tienesDatosParaCopiar
                                ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title={tienesDatosParaCopiar ? "Copiar este perfil" : "Completa algunos campos para poder copiar"}
                            disabled={!tienesDatosParaCopiar}
                          >
                            <IconCopy size={16} />
                          </Button>
                        )
                      })()}
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => pegarPerfil(index)}
                        className={`h-8 w-8 p-0 ${
                          perfilCopiado.current
                            ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        title={perfilCopiado.current ? "Pegar perfil copiado" : "Primero copia un perfil"}
                        disabled={!perfilCopiado.current}
                      >
                        <IconClipboard size={16} />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarPerfil(index)}
                        disabled={fields.length === 1}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar perfil"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                    <div></div>
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
                    Email Principal
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
                    Clave Principal
                  </Label>
                  <div className="relative">
                    <Input
                      {...register('clave')}
                      type={mostrarClave ? "text" : "password"}
                      placeholder="Contraseña"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setMostrarClave(!mostrarClave)}
                    >
                      {mostrarClave ? (
                        <IconEyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <IconEye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
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