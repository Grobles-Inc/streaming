import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconLoader2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton'

import { cuentaFormSchema, CuentaForm, Tipo } from '../data/schema'
import { tipos } from '../data/data'
import { useProductosByProveedor } from '../../productos/queries'

// TODO: Reemplazar con el contexto de autenticación real
const MOCK_PROVEEDOR_ID = 'e5b63d58-eab6-4628-a427-d86ee703d304'

interface CuentaFormProps {
  trigger?: React.ReactNode
  defaultValues?: Partial<CuentaForm>
  onSubmit?: (data: CuentaForm) => void | Promise<void>
  title?: string
  description?: string
}

export function CuentaFormDialog({
  trigger,
  defaultValues,
  onSubmit,
  title = 'Nueva Cuenta',
  description = 'Completa la información para agregar una nueva cuenta.',
}: CuentaFormProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Obtener productos del proveedor actual
  const { data: productos, isLoading: isLoadingProductos } = useProductosByProveedor(MOCK_PROVEEDOR_ID)

  const form = useForm<CuentaForm>({
    resolver: zodResolver(cuentaFormSchema),
    defaultValues: {
      productoId: '',
      tipo: 'cuenta' as Tipo,
      cuentaEmail: '',
      cuentaClave: '',
      cuentaUrl: '',
      perfil: '',
      pin: '',
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: CuentaForm) => {
    setIsLoading(true)
    try {
      await onSubmit?.(data)
      setOpen(false)
      form.reset()
    } catch (error) {
      // Error será manejado por el hook mutation que lo llame
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Producto */}
              <FormField
                control={form.control}
                name='productoId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona un producto' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingProductos ? (
                          <div className='p-2'>
                            <Skeleton className='h-4 w-full mb-2' />
                            <Skeleton className='h-4 w-full mb-2' />
                            <Skeleton className='h-4 w-full' />
                          </div>
                        ) : productos && productos.length > 0 ? (
                          productos.map((producto) => (
                            <SelectItem key={producto.id} value={producto.id}>
                              {producto.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <div className='p-2 text-sm text-muted-foreground'>
                            No hay productos disponibles
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name='cuentaEmail'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de la cuenta *</FormLabel>
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
                name='cuentaClave'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clave de la cuenta *</FormLabel>
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

            {/* URL */}
            <FormField
              control={form.control}
              name='cuentaUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de acceso (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      type='url' 
                      placeholder='https://ejemplo.com' 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Perfil */}
              <FormField
                control={form.control}
                name='perfil'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Nombre del perfil' 
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
                        type='password' 
                        placeholder='PIN de seguridad' 
                        maxLength={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading && (
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Guardar cuenta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 