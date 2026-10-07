import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { PhoneInput } from '@/components/phone-input'
import { signUp } from '@/features/auth/api/sign-up'
import { TurnstileWidget } from '@/features/security/components/turnstile-widget'
import {
  checkEmailAvailability,
  checkUsernameAvailability,
} from '@/features/users/api/check-availability'
import { ReferralCodeFeedback } from '@/features/users/components/referral-code-feedback'
import { useAvailabilityField } from '@/features/users/hooks/use-availability-field'
import { type SignUpFormData, signUpSchema } from '../schema'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const navigate = useNavigate()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      usuario: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      codigoReferido: '',
    },
  })

  const emailCheck = useAvailabilityField({
    check: checkEmailAvailability,
    form,
    fieldName: 'email',
    duplicateMessage: 'Este email ya está registrado',
  })

  const usernameCheck = useAvailabilityField({
    check: checkUsernameAvailability,
    form,
    fieldName: 'usuario',
    duplicateMessage: 'Este nombre de usuario ya está en uso',
    availableMessage: 'Usuario disponible',
  })

  async function onSubmit(values: SignUpFormData) {
    setIsLoading(true)

    // Turnstile tokens are single use, so invalidate before spending one.
    setTurnstileToken(null)
    setCaptchaResetKey((key) => key + 1)

    if (emailCheck.isDuplicate || usernameCheck.isDuplicate) {
      setIsLoading(false)
      return
    }

    const result = await signUp(values, turnstileToken)

    if (!result.ok) {
      toast.error(result.reason)
      if (result.field) {
        form.setError(result.field, {
          type: 'manual',
          message: result.reason,
        })
      }
      setIsLoading(false)
      return
    }

    toast.success('¡Cuenta creada!', {
      description: result.approvalRequired
        ? 'Tu cuenta quedó pendiente de aprobación. Te avisaremos cuando un administrador la habilite.'
        : 'Ya puedes iniciar sesión con tus credenciales.',
    })
    navigate({ to: '/sign-in' })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-3'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='nombres'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder='Nombres' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='apellidos'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder='Apellidos' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='usuario'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input
                  placeholder='usuario'
                  autoComplete='username'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    usernameCheck.validate(e.target.value)
                  }}
                />
              </FormControl>
              {usernameCheck.isChecking && (
                <p className='text-muted-foreground flex items-center gap-2 text-xs'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Verificando disponibilidad...
                </p>
              )}
              {usernameCheck.isDuplicate && (
                <p className='text-destructive text-xs'>
                  {usernameCheck.message}
                </p>
              )}
              {usernameCheck.state === 'available' && (
                <p className='text-muted-foreground text-xs'>
                  {usernameCheck.message}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Email'
                  autoComplete='email'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    emailCheck.validate(e.target.value)
                  }}
                />
              </FormControl>
              {emailCheck.isChecking && (
                <p className='text-muted-foreground flex items-center gap-2 text-xs'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Verificando disponibilidad...
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='telefono'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry='PE'
                  placeholder='Teléfono'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repite tu contraseña</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='********'
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='codigoReferido'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de referido (opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder='ABC1234567'
                  className='font-mono uppercase'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                  }}
                />
              </FormControl>
              {field.value && (
                <ReferralCodeFeedback code={field.value} debounced />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <TurnstileWidget
          action='signup'
          onTokenChange={setTurnstileToken}
          resetKey={captchaResetKey}
          className='mt-2'
        />

        <Button type='submit' disabled={isLoading} className='mt-2'>
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            'Crear cuenta'
          )}
        </Button>

        <div className='text-muted-foreground text-center text-sm'>
          ¿Ya tienes una cuenta?{' '}
          <Button variant='link' className='h-auto p-0' asChild>
            <Link to='/sign-in'>Inicia sesión</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}
