'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUsersContext } from '../context/users-context'
import { toast } from 'sonner'
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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { userTypes } from '../data/data'
import { MappedUser } from '../data/schema'

const formSchema = z
  .object({
    nombres: z.string().min(1, { message: 'Los nombres son requeridos.' }),
    apellidos: z.string().min(1, { message: 'Los apellidos son requeridos.' }),
    email: z.string().email({ message: 'Email válido requerido.' }),
    usuario: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres.' }),
    password: z.string().optional(),
    telefono: z.string().min(1, { message: 'El teléfono es requerido.' }),
    codigo_referido: z.string().optional(),
    rol: z.string().min(1, { message: 'El rol es requerido.' }),
    isEdit: z.boolean(),
  })
  .refine((data) => {
    // Solo requerir password para usuarios nuevos
    if (!data.isEdit && (!data.password || data.password.length < 6)) {
      return false
    }
    return true
  }, {
    message: "La contraseña debe tener al menos 6 caracteres para usuarios nuevos.",
    path: ["password"], // Esto indica qué campo mostrar el error
  })
type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: MappedUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const { createUser, updateUser } = useUsersContext()
  
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          nombres: currentRow.nombres,
          apellidos: currentRow.apellidos,
          email: currentRow.email,
          usuario: currentRow.usuario,
          password: '', // No mostrar password actual por seguridad
          rol: currentRow.rol,
          telefono: currentRow.telefono || '',
          codigo_referido: currentRow.codigo_referido || '',
          isEdit,
        }
      : {
          nombres: '',
          apellidos: '',
          email: '',
          usuario: '',
          password: '',
          rol: '',
          telefono: '',
          codigo_referido: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit && currentRow) {
        // Actualizar usuario (sin password en edición por seguridad)
        const updateData: any = {
          nombres: values.nombres,
          apellidos: values.apellidos,
          email: values.email,
          usuario: values.usuario,
          telefono: values.telefono,
          codigo_referido: values.codigo_referido || '',
          rol: values.rol as 'admin' | 'provider' | 'seller',
        }
        
        // Solo incluir password si se proporcionó una nueva
        if (values.password && values.password.length >= 6) {
          updateData.password = values.password
        }
        
        const result = await updateUser(currentRow.id, updateData)
        
        if (result) {
          toast.success('Usuario actualizado exitosamente')
          form.reset()
          onOpenChange(false)
        } else {
          toast.error('Error al actualizar usuario')
        }
      } else {
        // Crear usuario
        const result = await createUser({
          nombres: values.nombres,
          apellidos: values.apellidos,
          email: values.email,
          usuario: values.usuario,
          password: values.password || '',
          telefono: values.telefono,
          codigo_referido: values.codigo_referido || '',
          rol: values.rol as 'admin' | 'provider' | 'seller',
        })
        
        if (result) {
          toast.success('Usuario creado exitosamente')
          form.reset()
          onOpenChange(false)
        } else {
          toast.error('Error al crear usuario')
        }
      }
    } catch (error) {
      console.error('Error in user form:', error)
      toast.error(isEdit ? 'Error al actualizar usuario' : 'Error al crear usuario')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Actualiza los datos del usuario aquí. ' : 'Crea un nuevo usuario aquí. '}
            Haz clic en guardar cuando termines.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='nombres'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Nombres
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Juan Carlos'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='apellidos'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Apellidos
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Pérez García'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='usuario@ejemplo.com'
                        className='col-span-4'
                        autoComplete='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='usuario'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Usuario
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='usuario123'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      {isEdit ? 'Nueva Contraseña' : 'Contraseña'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={isEdit ? 'Dejar vacío para mantener actual' : 'Contraseña'}
                        className='col-span-4'
                        autoComplete='new-password'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='telefono'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+123456789'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='codigo_referido'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Código Referido
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='REF123 (opcional)'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='rol'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      Rol
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Selecciona un rol'
                      className='col-span-4'
                      items={userTypes.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
