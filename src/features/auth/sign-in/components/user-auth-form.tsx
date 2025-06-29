import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Por favor, ingrese su email' })
    .email({ message: 'Dirección de email inválida' }),
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
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const { error } = await signIn(data.email, data.password)
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
        default:
          navigate({ to: '/dashboard' })
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
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
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                Olvidó su contraseña?
              </Link>
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
