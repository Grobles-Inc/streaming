'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUsersContext } from '../context/users-context-new'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { userTypes } from '../data/data'
import { MappedUser } from '../data/schema'

const formSchema = z
  .object({
    nombres: z.string().min(1, { message: 'Los nombres son requeridos.' }),
    apellidos: z.string().min(1, { message: 'Los apellidos son requeridos.' }),
    telefono: z.string().min(1, { message: 'El teléfono es requerido.' }),
    rol: z.string().min(1, { message: 'El rol es requerido.' }),
    isEdit: z.boolean(),
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
          rol: currentRow.rol,
          telefono: currentRow.telefono || '',
          isEdit,
        }
      : {
          nombres: '',
          apellidos: '',
          rol: '',
          telefono: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      if (isEdit && currentRow) {
        // Actualizar usuario
        const result = await updateUser(currentRow.id, {
          nombres: values.nombres,
          apellidos: values.apellidos,
          telefono: values.telefono,
          rol: values.rol as 'admin' | 'provider' | 'seller',
        })
        
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
          telefono: values.telefono,
          rol: values.rol as 'admin' | 'provider' | 'seller',
          email: '', // Email requerido pero se puede dejar vacío inicialmente
          balance: 0, // Saldo inicial por defecto
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
