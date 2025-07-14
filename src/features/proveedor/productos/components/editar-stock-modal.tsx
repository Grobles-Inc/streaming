import { useEffect, useState } from 'react'
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
import { IconEdit, IconEye, IconEyeOff } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateStockProducto } from '../queries'
import type { Database } from '@/types/supabase'

type StockProducto = Database['public']['Tables']['stock_productos']['Row']

// Schema para edición
const editStockFormSchema = z.object({
  email: z.string().optional(),
  clave: z.string().optional(), 
  url: z.string().optional(),
  perfil: z.string().optional(),
  pin: z.string().optional(),
  estado: z.enum(['disponible', 'vendido']),
  soporte_stock_producto: z.enum(['activo', 'vencido', 'soporte']),
})

type EditStockFormData = z.infer<typeof editStockFormSchema>

interface EditarStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: StockProducto | null
}

export function EditarStockModal({ 
  open, 
  onOpenChange, 
  stock 
}: EditarStockModalProps) {
  const updateStockMutation = useUpdateStockProducto()

  // Estado para controlar visibilidad de contraseña
  const [mostrarClave, setMostrarClave] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<EditStockFormData>({
    resolver: zodResolver(editStockFormSchema),
    defaultValues: {
      email: '',
      clave: '',
      url: '',
      perfil: '',
      pin: '',
      estado: 'disponible',
      soporte_stock_producto: 'activo'
    }
  })

  // Pre-cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && stock) {
      reset({
        email: stock.email || '',
        clave: stock.clave || '',
        url: stock.url || '',
        perfil: stock.perfil || '',
        pin: stock.pin || '',
        estado: stock.estado,
        soporte_stock_producto: stock.soporte_stock_producto
      })
      // Resetear estado de visibilidad al abrir modal
      setMostrarClave(false)
    }
  }, [open, stock, reset])

  const onSubmit = async (data: EditStockFormData) => {
    if (!stock?.id) return

    try {
      await updateStockMutation.mutateAsync({
        id: stock.id,
        updates: {
          email: data.email || null,
          clave: data.clave || null,
          url: data.url || null,
          perfil: data.perfil || null,
          pin: data.pin || null,
          estado: data.estado,
          soporte_stock_producto: data.soporte_stock_producto
        }
      })

      onOpenChange(false)
      reset()
    } catch (error) {
      // El error ya será mostrado por el toast del hook
    }
  }

  if (!stock) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[70vw] !max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconEdit size={20} />
            Editar Stock #{stock.id}
          </DialogTitle>
          <DialogDescription>
            Modifica los datos de esta existencia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información del producto (solo lectura) */}
          <div className="space-y-2">
            <Label>Tipo de Stock</Label>
            <Input
              value={stock.tipo === 'cuenta' ? 'CUENTA' : stock.tipo === 'perfiles' ? 'PERFILES' : 'COMBO'}
              readOnly
              className="bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Campos editables */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register('email')}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clave">Clave</Label>
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
              <Label htmlFor="url">URL</Label>
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

          {/* Estados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select 
                value={watch('estado')} 
                onValueChange={(value: 'disponible' | 'vendido') => setValue('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="soporte_stock_producto">Estado de Soporte</Label>
              <Select 
                value={watch('soporte_stock_producto')} 
                onValueChange={(value: 'activo' | 'vencido' | 'soporte') => setValue('soporte_stock_producto', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="soporte">Soporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              disabled={updateStockMutation.isPending}
              className="bg-black text-white hover:bg-gray-800"
            >
              {updateStockMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 