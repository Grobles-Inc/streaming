import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import logoImage from '@/assets/logo.png'
import { RegistrationTokenValidator } from '@/lib/registration-token-validator'
import type { RegistrationTokenData } from '@/lib/registration-token-validator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/password-input'
import { PhoneInput } from '@/components/phone-input'
import {
  checkEmailAvailability,
  checkUsernameAvailability,
} from '@/features/users/api/check-availability'
import { mapUserCreateError } from '@/features/users/api/map-user-create-error'
import { ReferralCodeFeedback } from '@/features/users/components/referral-code-feedback'
import { useAvailabilityField } from '@/features/users/hooks/use-availability-field'
import { UsersService } from '@/features/users/services/users.service'

// Schema de validación
const registerWithReferralSchema = z
  .object({
    nombres: z
      .string()
      .min(1, { message: 'El nombre es requerido' })
      .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    apellidos: z
      .string()
      .min(1, { message: 'El apellido es requerido' })
      .min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
    usuario: z
      .string()
      .min(1, { message: 'El nombre de usuario es requerido' })
      .min(3, { message: 'El usuario debe tener al menos 3 caracteres' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Solo letras, números y guiones bajos',
      }),
    email: z
      .string()
      .min(1, { message: 'El email es requerido' })
      .email({ message: 'Email inválido' }),
    telefono: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 12, {
        message: 'El teléfono debe incluir código de país y al menos 9 dígitos',
      }),
    password: z
      .string()
      .min(1, { message: 'La contraseña es requerida' })
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string(),
    // Campos bloqueados que vienen del link
    codigoReferido: z.string(),
    rol: z.enum(['registered', 'provider', 'seller']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerWithReferralSchema>

export function RegisterWithReferralForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenData, setTokenData] = useState<RegistrationTokenData | null>(null)
  const [registrationAllowed, setRegistrationAllowed] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const navigate = useNavigate()

  // Obtener parámetros de URL usando TanStack Router
  const searchParams = useSearch({ from: '/(auth)/register' }) as {
    token?: string
    ref?: string
  }

  // Validar token de registro al cargar el componente
  useEffect(() => {
    const validateRegistrationToken = async () => {
      setValidatingToken(true)

      // Obtener el token y el código de referido de la URL
      const token = searchParams.token
      const refCode = searchParams.ref

      // No se registra el token: es la credencial del link de invitación.

      // Verificar si el registro está permitido
      const registrationCheck =
        await RegistrationTokenValidator.isRegistrationAllowed(token)

      if (!registrationCheck.allowed) {
        setRegistrationAllowed(false)
        setErrorMessage(registrationCheck.reason || 'Acceso no autorizado')
        setValidatingToken(false)
        return
      }

      // Si el código de referido viene en la URL, lo agregamos a los datos del token
      if (refCode) {
        console.log('Se detectó código de referido en URL:', refCode)

        // Asignamos el código de referido a los datos del token
        registrationCheck.data!.referralCode = refCode
        // No se registra registrationCheck.data: incluye validationToken.

        // Validar que el código de referido sea válido
        try {
          const referidoUsuario =
            await UsersService.validateReferralCode(refCode)
          if (referidoUsuario) {
            console.log('Usuario referido validado:', referidoUsuario)
          } else {
            console.warn('Código de referido no válido:', refCode)
            // Mantenemos el código aunque sea inválido para mostrar el error
          }
        } catch (err) {
          console.error('Error validando código de referido:', err)
        }
      }

      // Si llegamos aquí, el token es válido
      setTokenData(registrationCheck.data!)
      setRegistrationAllowed(true)
      setValidatingToken(false)
    }

    validateRegistrationToken()
  }, [searchParams.token, searchParams.ref])

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerWithReferralSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      usuario: '',
      email: '',
      telefono: '',
      password: '',
      confirmPassword: '',
      codigoReferido: '',
      rol: 'registered',
    },
  })

  const emailCheck = useAvailabilityField({
    check: checkEmailAvailability,
    form,
    fieldName: 'email',
    duplicateMessage: 'Este email ya está registrado',
    availableMessage: '',
  })

  const usernameCheck = useAvailabilityField({
    check: checkUsernameAvailability,
    form,
    fieldName: 'usuario',
    duplicateMessage: 'Este nombre de usuario ya está en uso',
    availableMessage: 'Usuario disponible',
  })

  // Actualizar valores cuando cambien los datos del token
  useEffect(() => {
    if (tokenData) {
      // Actualizar el rol siempre
      form.setValue(
        'rol',
        tokenData.role as 'registered' | 'provider' | 'seller'
      )

      // Actualizar el código de referido si existe
      if (tokenData.referralCode) {
        // No se registra el código de referido ajeno.
        form.setValue('codigoReferido', tokenData.referralCode)
      }
    }
  }, [tokenData, form])

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)

    // Verificar si hay errores de validación de email duplicado
    if (emailCheck.isDuplicate) {
      toast.error('Error en el registro', {
        description: 'El email ya está registrado',
      })
      setIsLoading(false)
      return
    }

    // Verificar si hay errores de validación de username duplicado
    if (usernameCheck.isDuplicate) {
      toast.error('Error en el registro', {
        description: 'El nombre de usuario ya está en uso',
      })
      setIsLoading(false)
      return
    }

    // Verificar si hay errores en el formulario
    if (Object.keys(form.formState.errors).length > 0) {
      toast.error('Error en el registro', {
        description: 'Por favor corrige todos los errores antes de continuar',
      })
      setIsLoading(false)
      return
    }

    try {
      // No se registran los values: contienen password y confirmPassword.

      // Extraer el código de referido de los valores
      const { codigoReferido, confirmPassword, rol, ...userData } = values

      // Crear el usuario usando el servicio correcto.
      // El resultado no se registra: la fila incluye el password en texto plano.
      await UsersService.createUserWithReferral(
        {
          email: userData.email,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          usuario: userData.usuario,
          password: userData.password,
          telefono: userData.telefono,
          rol: rol || 'registered', // Usar el rol del link
        },
        codigoReferido // Código del referente (viene del enlace)
      )

      // DESHABILITADO: No invalidar tokens porque ahora son permanentes
      // Los tokens solo se invalidan cuando se regeneran explícitamente
      // if (tokenData?.validationToken) {
      //   await RegistrationTokenValidator.invalidateToken(tokenData.validationToken)
      // }

      // Mostrar mensaje de éxito y redirigir al login
      toast.success('¡Registro exitoso!', {
        description:
          'Tu cuenta ha sido creada correctamente. Por favor inicia sesión con tus credenciales.',
      })

      // Redirigir al login
      navigate({ to: '/sign-in' })
    } catch (error) {
      console.error('Error en el registro:', error)

      const mapped = mapUserCreateError(error)
      if (mapped.field) {
        form.setError(mapped.field, {
          type: 'manual',
          message: mapped.reason,
        })
        return
      }

      toast.error('Error en el registro', { description: mapped.reason })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se valida el token
  if (validatingToken) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='space-y-4 text-center'>
              <Loader2 className='mx-auto h-8 w-8 animate-spin' />
              <div>
                <h3 className='font-semibold'>Validando token de registro</h3>
                <p className='text-muted-foreground text-sm'>
                  Verificando la validez de tu invitación...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar error si el registro no está permitido
  if (!registrationAllowed) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='space-y-4 text-center'>
              <AlertTriangle className='text-destructive mx-auto h-8 w-8' />
              <div>
                <h3 className='text-destructive font-semibold'>
                  Acceso Denegado
                </h3>
                <p className='text-muted-foreground text-sm'>{errorMessage}</p>
              </div>
              <Button asChild variant='outline'>
                <Link to='/sign-in'>Ir al Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='mx-auto flex h-screen max-w-sm flex-col justify-center gap-8 px-6 md:px-0'>
      <div className='flex flex-col items-center gap-2'>
        <img src={logoImage} alt='Logo' className='h-12 w-auto' />
        <div className='text-center'>
          <h2 className='text-xl font-bold'>Registro por Invitación</h2>
          <div className='mt-2 flex items-center justify-center gap-2'>
            <ShieldCheck className='h-4 w-4 text-green-600' />
            <span className='text-xs font-medium text-green-600'>
              Invitación Verificada
            </span>
          </div>
        </div>
      </div>

      {/* Mostrar información del referido si existe */}
      {tokenData?.referralCode && (
        <Card>
          <CardContent className='pt-4'>
            <div className='space-y-2 text-center'>
              <Badge variant='secondary'>
                Código de Referido: {tokenData.referralCode}
              </Badge>
              <Badge variant='outline'>Rol Asignado: {tokenData.role}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='nombres'
            render={({ field }) => (
              <FormItem>
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
                <FormControl>
                  <Input placeholder='Apellidos' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='usuario'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder='Usuario'
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      usernameCheck.validate(e.target.value)
                    }}
                  />
                </FormControl>
                {usernameCheck.isChecking && (
                  <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    Verificando disponibilidad...
                  </div>
                )}
                {usernameCheck.message && !usernameCheck.isChecking && (
                  <div
                    className={`text-xs ${usernameCheck.isDuplicate ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {usernameCheck.message}
                  </div>
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
                <FormControl>
                  <PhoneInput
                    {...field}
                    defaultCountry='PE'
                    placeholder='Teléfono'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Email'
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      emailCheck.validate(e.target.value)
                    }}
                  />
                </FormControl>
                {emailCheck.isChecking && (
                  <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    Verificando disponibilidad...
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput placeholder='Contraseña' {...field} />
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
                <FormControl>
                  <PasswordInput
                    placeholder='Repite tu contraseña'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {tokenData?.referralCode ? (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label>Código de Referido:</Label>
                <Badge className='font-mono'>{tokenData.referralCode}</Badge>
              </div>
              {/* Validación del código de referido proporcionado en la URL */}
              <ReferralCodeFeedback code={tokenData.referralCode} />
              <FormField
                control={form.control}
                name='codigoReferido'
                render={() => (
                  <input
                    type='hidden'
                    value={tokenData.referralCode}
                    {...form.register('codigoReferido')}
                  />
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name='codigoReferido'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Referido (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: ABC123 (opcional)' {...field} />
                  </FormControl>
                  {field.value && field.value.trim() !== '' && (
                    <ReferralCodeFeedback code={field.value} debounced />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className='mt-8 flex flex-col'>
            <Button
              type='submit'
              className='col-span-2 w-full'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Crear Cuenta'
              )}
            </Button>
            <div className='text-muted-foreground text-center text-sm'>
              ¿Ya tienes una cuenta?{' '}
              <Button variant='link' className='p-0' asChild>
                <Link to='/sign-in' className='underline'>
                  Inicia sesión aquí
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
