import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { cuentaFormSchema, tipos, type CuentaForm } from '../data'
import { useProductosByProveedor } from '../../productos/queries'
import { useCreateCuenta, useUpdateCuenta } from '../queries'
import { useAuthStore } from '@/stores/authStore'
import { Cuenta } from '../data/schema'

interface CuentaFormComponentProps {
  cuentaToEdit?: Cuenta
  onClose: () => void
  onSuccess: () => void
}

export function CuentaForm({ cuentaToEdit, onClose, onSuccess }: CuentaFormComponentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const isEditing = !!cuentaToEdit
  
  
  // Obtener productos del proveedor actual
  const { data: productos, isLoading: isLoadingProductos, error: productosError } = useProductosByProveedor(user?.id || '')
  const createCuentaMutation = useCreateCuenta()
  const updateCuentaMutation = useUpdateCuenta()


  const form = useForm<CuentaForm>({
    resolver: zodResolver(cuentaFormSchema),
    defaultValues: {
      producto_id: cuentaToEdit?.producto_id || '',
      tipo: cuentaToEdit?.tipo || 'cuenta',
      email: cuentaToEdit?.email || '',
      clave: cuentaToEdit?.clave || '',
      url: cuentaToEdit?.url || '',
      perfil: cuentaToEdit?.perfil || '',
      pin: cuentaToEdit?.pin || '',
      publicado: cuentaToEdit?.publicado ?? true,
    },
  })

  const handleSubmit = async (data: CuentaForm) => {
    if (!user) {
      console.error('❌ No hay usuario autenticado')
      return
    }
    
    console.log('🚀 Enviando datos de cuenta:', data)
    
    setIsSubmitting(true)
    try {
      if (isEditing && cuentaToEdit) {
        await updateCuentaMutation.mutateAsync({
          id: cuentaToEdit.id,
          updates: {
            producto_id: data.producto_id,
            tipo: data.tipo,
            email: data.email || null,
            clave: data.clave || null,
            url: data.url || null,
            perfil: data.perfil || null,
            pin: data.pin || null,
            publicado: data.publicado,
          }
        })
      } else {
        await createCuentaMutation.mutateAsync({
          producto_id: data.producto_id,
          tipo: data.tipo,
          email: data.email || null,
          clave: data.clave || null,
          url: data.url || null,
          perfil: data.perfil || null,
          pin: data.pin || null,
          publicado: data.publicado,
        })
      }
      onSuccess()
    } catch (error) {
      console.error('❌ Error al procesar cuenta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar estado de carga si no hay usuario
  if (!user) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Cargando...</DialogTitle>
            <DialogDescription>
              Obteniendo información del usuario...
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-center p-8'>
            <IconLoader2 className='h-8 w-8 animate-spin' />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información de la cuenta existente.'
              : 'Completa la información para agregar una nueva cuenta a tu inventario.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Producto */}
              <FormField
                control={form.control}
                name='producto_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona un producto' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingProductos ? (
                          <div className='p-2'>
                            <div className='flex items-center space-x-2'>
                              <IconLoader2 className='h-4 w-4 animate-spin' />
                              <span className='text-sm'>Cargando productos...</span>
                            </div>
                          </div>
                        ) : productosError ? (
                          <div className='p-2 text-sm text-red-600'>
                            Error al cargar productos: {productosError.message}
                          </div>
                        ) : productos && productos.length > 0 ? (
                          productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <div className='p-2 text-sm text-muted-foreground'>
                            No hay productos disponibles. Primero debes crear productos.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo */}
              <FormField
                control={form.control}
                name='tipo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona el tipo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tipos.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className='flex items-center space-x-2'>
                              <tipo.icon size={16} className={tipo.color} />
                              <span>{tipo.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Email */}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de la cuenta</FormLabel>
                    <FormControl>
                      <Input 
                        type='email' 
                        placeholder='ejemplo@servicio.com' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Clave */}
              <FormField
                control={form.control}
                name='clave'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave de la cuenta</FormLabel>
                    <FormControl>
                      <Input 
                        type='password' 
                        placeholder='Clave de acceso' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* URL */}
              <FormField
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del servicio</FormLabel>
                    <FormControl>
                      <Input 
                        type='url' 
                        placeholder='https://servicio.com' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PIN */}
              <FormField
                control={form.control}
                name='pin'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type='text' 
                        placeholder='1234' 
                        maxLength={8}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Perfil */}
            <FormField
              control={form.control}
              name='perfil'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Nombre del perfil o información adicional' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Publicado */}
            <FormField
              control={form.control}
              name='publicado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>
                      Publicar cuenta
                    </FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      La cuenta estará disponible para venta inmediatamente.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type='submit' 
                disabled={isSubmitting}
              >
                {isSubmitting && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEditing ? 'Actualizar Cuenta' : 'Crear Cuenta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 