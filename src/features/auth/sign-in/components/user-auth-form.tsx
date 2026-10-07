import { TurnstileWidget } from '@/features/security/components/turnstile-widget'
import { verifyGate } from '@/features/security/api/verify-gate'
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
import { Link, useNavigate } from '@tanstack/react-router'
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
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

    // Turnstile tokens are single use, so the widget is invalidated after every
    // attempt and the next submit needs a freshly solved challenge.
    setTurnstileToken(null)
    setCaptchaResetKey((key) => key + 1)

    const gate = await verifyGate(turnstileToken, 'signin')
    if (!gate.ok) {
      toast.error(gate.reason)
      setIsLoading(false)
      return
    }

    const { error } = await signIn(data.usuario, data.password)
    if (error) {
      toast.error(error.message)
    } else {
      navigate({ to: '/' })
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
        <TurnstileWidget
          action='signin'
          onTokenChange={setTurnstileToken}
          resetKey={captchaResetKey}
          className='mt-2'
        />
        <Button className='mt-2' disabled={isLoading}>
          Iniciar sesión
        </Button>
        <div className='text-center text-sm text-muted-foreground'>
          ¿No tienes cuenta?{' '}
          <Button variant='link' className='h-auto p-0' asChild>
            <Link to='/sign-up'>Regístrate</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}