import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconClipboard,
  IconCopy,
  IconDots,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/stores/authStore'
import {
  useCreateStockProducto,
  useProductosByProveedor,
  useStockProductosByProductoId,
} from '../queries'

// Schema básico con campos opcionales
const stockFormSchema = z.object({
  producto_id: z.number().min(1, 'Selecciona un producto'),
  tipo: z.enum(['cuenta', 'perfiles', 'combo']),
  email: z.string().optional(),
  clave: z.string().optional(),
  url: z.string().optional(),
  perfil: z.string().optional(),
  pin: z.string().optional(),
  perfiles: z
    .array(
      z.object({
        email: z.string().optional(),
        clave: z.string().optional(),
        url: z.string().optional(),
        perfil: z.string().optional(),
        pin: z.string().optional(),
      })
    )
    .optional(),
})

type StockFormData = z.infer<typeof stockFormSchema>
type PerfilForm = NonNullable<StockFormData['perfiles']>[number]

const PERFIL_VACIO: PerfilForm = {
  email: '',
  clave: '',
  url: '',
  perfil: '',
  pin: '',
}

interface AgregarStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId?: number
}

export function AgregarStockModal({
  open,
  onOpenChange,
  productoId,
}: AgregarStockModalProps) {
  const { user } = useAuth()
  const { data: productos } = useProductosByProveedor(user?.id ?? '')
  const createStockMutation = useCreateStockProducto()

  // Estado para almacenar datos copiados
  const [perfilCopiado, setPerfilCopiado] = useState<PerfilForm | null>(null)

  // Estado para controlar visibilidad de contraseñas
  const [mostrarClave, setMostrarClave] = useState(false)
  const [mostrarClavePerfiles, setMostrarClavePerfiles] = useState<
    Record<number, boolean>
  >({})

  // Obtener el producto específico si se pasa un productoId
  const productoSeleccionado = productoId
    ? productos?.find((p) => p.id === productoId)
    : null

  // Obtener stock existente para determinar si el tipo debe estar bloqueado
  const { data: stockExistente } = useStockProductosByProductoId(productoId || 0)

  // Determinar si ya existe stock y cuál es el tipo
  const tipoExistente =
    stockExistente && stockExistente.length > 0 ? stockExistente[0].tipo : null
  const debeBloquearTipo = Boolean(stockExistente && stockExistente.length > 0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: {
      producto_id: productoId || 0,
      tipo: 'cuenta',
      perfiles: [{ ...PERFIL_VACIO }],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'perfiles',
  })

  const tipoSeleccionado = watch('tipo')

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      const tipoAUsar = tipoExistente || 'cuenta'

      reset({
        producto_id: productoId || 0,
        tipo: tipoAUsar as 'cuenta' | 'perfiles' | 'combo',
        email: '',
        clave: '',
        url: '',
        perfil: '',
        pin: '',
        perfiles: [{ ...PERFIL_VACIO }],
      })
      setMostrarClave(false)
      setMostrarClavePerfiles({})
      setPerfilCopiado(null)
    }
  }, [open, productoId, tipoExistente, reset])

  // Limpiar campos no necesarios cuando cambia el tipo
  useEffect(() => {
    if (tipoSeleccionado === 'perfiles') {
      // Limpiar campos individuales para perfiles
      setValue('email', '')
      setValue('clave', '')
      setValue('url', '')
      setValue('perfil', '')
      setValue('pin', '')
      // Garantizar al menos una fila editable
      replace([{ ...PERFIL_VACIO }])
    } else {
      // Limpiar array de perfiles para cuenta/combo
      setValue('perfiles', [])
    }
  }, [tipoSeleccionado, setValue, replace])

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
            soporte_stock_producto: 'activo' as const,
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
          soporte_stock_producto: 'activo' as const,
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
    append({ ...PERFIL_VACIO })
  }

  const eliminarPerfil = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const copiarPerfil = (index: number) => {
    const perfil = watch(`perfiles.${index}`)
    if (perfil) {
      setPerfilCopiado({
        email: perfil.email || '',
        clave: perfil.clave || '',
        url: perfil.url || '',
        perfil: perfil.perfil || '',
        pin: perfil.pin || '',
      })
    }
  }

  const pegarPerfil = (index: number) => {
    if (!perfilCopiado) return

    setValue(`perfiles.${index}.email`, perfilCopiado.email)
    setValue(`perfiles.${index}.clave`, perfilCopiado.clave)
    setValue(`perfiles.${index}.url`, perfilCopiado.url)
    setValue(`perfiles.${index}.perfil`, perfilCopiado.perfil)
    setValue(`perfiles.${index}.pin`, perfilCopiado.pin)
  }

  const toggleMostrarClavePerfiles = (index: number) => {
    setMostrarClavePerfiles((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const perfilTieneDatos = (index: number) => {
    const perfil = watch(`perfiles.${index}`)
    if (!perfil) return false

    return Boolean(
      perfil.email?.trim() ||
        perfil.clave?.trim() ||
        perfil.url?.trim() ||
        perfil.perfil?.trim() ||
        perfil.pin?.trim()
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex !max-h-[150vh] !max-w-[90vw] flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Agregar Stock
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='min-h-0 flex-1 space-y-6 overflow-y-auto py-4 pr-1'>
            {/* Selector de Producto */}
            <div className='space-y-2'>
              <Label htmlFor='producto_id'>
                Producto <span className='text-destructive'>*</span>
              </Label>
              {productoId ? (
                // Campo de solo lectura cuando se pasa un productoId específico
                <Input
                  value={productoSeleccionado?.nombre || 'Cargando...'}
                  readOnly
                  className='bg-muted text-muted-foreground'
                  placeholder='Producto seleccionado'
                />
              ) : (
                // Select normal cuando no se pasa productoId
                <Select
                  value={watch('producto_id')?.toString()}
                  onValueChange={(value) =>
                    setValue('producto_id', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un producto' />
                  </SelectTrigger>
                  <SelectContent>
                    {productos?.map((producto) => (
                      <SelectItem
                        key={producto.id}
                        value={producto.id.toString()}
                      >
                        {producto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.producto_id && (
                <p className='text-sm text-destructive'>
                  {errors.producto_id.message}
                </p>
              )}
            </div>

            {/* Selector de Tipo */}
            <div className='space-y-2'>
              <Label htmlFor='tipo'>
                Tipo <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={tipoSeleccionado}
                onValueChange={(value: 'cuenta' | 'perfiles' | 'combo') =>
                  setValue('tipo', value)
                }
                disabled={debeBloquearTipo}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona el tipo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cuenta'>CUENTA</SelectItem>
                  <SelectItem value='perfiles'>PERFILES</SelectItem>
                  <SelectItem value='combo'>COMBO</SelectItem>
                </SelectContent>
              </Select>
              {debeBloquearTipo && (
                <p className='text-sm text-muted-foreground'>
                  Este producto ya tiene stock de tipo{' '}
                  {tipoExistente?.toUpperCase()}
                </p>
              )}
            </div>

            {/* Campos para tipo CUENTA */}
            {tipoSeleccionado === 'cuenta' && (
              <div className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Cuenta Email</Label>
                    <Input
                      {...register('email')}
                      placeholder='correo@ejemplo.com'
                    />
                    {errors.email && (
                      <p className='text-sm text-destructive'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='clave'>Cuenta Clave</Label>
                    <div className='relative'>
                      <Input
                        {...register('clave')}
                        type={mostrarClave ? 'text' : 'password'}
                        placeholder='Contraseña'
                        className='pr-10'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute top-1/2 right-1 size-7 -translate-y-1/2'
                        onClick={() => setMostrarClave(!mostrarClave)}
                      >
                        {mostrarClave ? (
                          <IconEyeOff className='text-muted-foreground' />
                        ) : (
                          <IconEye className='text-muted-foreground' />
                        )}
                      </Button>
                    </div>
                    {errors.clave && (
                      <p className='text-sm text-destructive'>
                        {errors.clave.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='url'>Cuenta URL</Label>
                    <Input {...register('url')} placeholder='https://...' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='perfil'>Perfil</Label>
                    <Input
                      {...register('perfil')}
                      placeholder='Nombre del perfil'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='pin'>PIN</Label>
                    <Input {...register('pin')} placeholder='PIN' />
                  </div>
                </div>
              </div>
            )}

            {/* Campos para tipo PERFILES */}
            {tipoSeleccionado === 'perfiles' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label className='text-base font-medium'>
                    Perfiles ({fields.length})
                  </Label>
                  <Button type='button' onClick={agregarPerfil}>
                    <IconPlus size={16} className='mr-2' />
                    Agregar perfil
                  </Button>
                </div>

                <div className='overflow-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cuenta Email</TableHead>
                        <TableHead>Cuenta Clave</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>PIN</TableHead>
                        <TableHead className='w-10' />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Input
                              id={`perfiles.${index}.email`}
                              {...register(`perfiles.${index}.email`)}
                              placeholder='correo@ejemplo.com'
                            />
                            {errors.perfiles?.[index]?.email && (
                              <p className='mt-1 text-sm text-destructive'>
                                {errors.perfiles?.[index]?.email?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className='relative'>
                              <Input
                                id={`perfiles.${index}.clave`}
                                {...register(`perfiles.${index}.clave`)}
                                type={
                                  mostrarClavePerfiles[index]
                                    ? 'text'
                                    : 'password'
                                }
                                placeholder='Contraseña'
                                className='pr-10'
                              />
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='absolute top-1/2 right-1 size-7 -translate-y-1/2'
                                onClick={() => toggleMostrarClavePerfiles(index)}
                              >
                                {mostrarClavePerfiles[index] ? (
                                  <IconEyeOff className='text-muted-foreground' />
                                ) : (
                                  <IconEye className='text-muted-foreground' />
                                )}
                              </Button>
                            </div>
                            {errors.perfiles?.[index]?.clave && (
                              <p className='mt-1 text-sm text-destructive'>
                                {errors.perfiles?.[index]?.clave?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`perfiles.${index}.url`}
                              {...register(`perfiles.${index}.url`)}
                              placeholder='https://...'
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`perfiles.${index}.perfil`}
                              {...register(`perfiles.${index}.perfil`)}
                              placeholder='Nombre perfil'
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              id={`perfiles.${index}.pin`}
                              {...register(`perfiles.${index}.pin`)}
                              placeholder='PIN'
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  className='flex size-8 p-0 data-[state=open]:bg-muted'
                                >
                                  <IconDots className='size-4' />
                                  <span className='sr-only'>Abrir menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='w-40'>
                                <DropdownMenuItem
                                  onClick={() => copiarPerfil(index)}
                                  disabled={!perfilTieneDatos(index)}
                                >
                                  <IconCopy className='size-4' />
                                  Copiar perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => pegarPerfil(index)}
                                  disabled={!perfilCopiado}
                                >
                                  <IconClipboard className='size-4' />
                                  Pegar perfil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className='text-destructive'
                                  onClick={() => eliminarPerfil(index)}
                                  disabled={fields.length === 1}
                                >
                                  <IconTrash className='size-4' />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Campos para tipo COMBO */}
            {tipoSeleccionado === 'combo' && (
              <div className='space-y-4'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Principal</Label>
                    <Input
                      {...register('email')}
                      placeholder='correo@ejemplo.com'
                    />
                    {errors.email && (
                      <p className='text-sm text-destructive'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='clave'>Clave Principal</Label>
                    <div className='relative'>
                      <Input
                        {...register('clave')}
                        type={mostrarClave ? 'text' : 'password'}
                        placeholder='Contraseña'
                        className='pr-10'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute top-1/2 right-1 size-7 -translate-y-1/2'
                        onClick={() => setMostrarClave(!mostrarClave)}
                      >
                        {mostrarClave ? (
                          <IconEyeOff className='text-muted-foreground' />
                        ) : (
                          <IconEye className='text-muted-foreground' />
                        )}
                      </Button>
                    </div>
                    {errors.clave && (
                      <p className='text-sm text-destructive'>
                        {errors.clave.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='url'>URL del Combo</Label>
                    <Input {...register('url')} placeholder='https://...' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='perfil'>Descripción</Label>
                    <Input
                      {...register('perfil')}
                      placeholder='Descripción del combo'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='pin'>PIN/Código</Label>
                    <Input
                      {...register('pin')}
                      placeholder='PIN o código'
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <DialogFooter className='border-t pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type='submit' disabled={createStockMutation.isPending}>
              {createStockMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
