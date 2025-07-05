import { PasswordInput } from '@/components/password-input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  usuario: z
    .string()
    .min(1, { message: 'Por favor, ingrese su usuario o email' }),
  password: z
    .string()
    .min(1, {
      message: 'Por favor, ingrese su contraseña',
    })
    .min(7, {
      message: 'La contraseña debe tener al menos 7 caracteres',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuario: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const { error } = await signIn(data.usuario, data.password)
    if (error) {
      toast.error(error.message)
    } else {
      const user = useAuthStore.getState().user
      const userRole = user?.rol
      switch (userRole) {
        case 'admin':
          navigate({ to: '/admin/users' })
          break
        case 'provider':
          navigate({ to: '/proveedor/productos' })
          break
        case 'seller':
          navigate({ to: '/dashboard' })
          break
        default:
          navigate({ to: '/' })
          break
      }
    }
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='usuario'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input placeholder='usuario' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />

            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          Iniciar sesión
        </Button>
      </form>
    </Form>
  )
}
