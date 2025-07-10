import logoImage from '@/assets/logo.png'
import { PasswordInput } from '@/components/password-input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { UsersService } from '@/features/users/services/users.service'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RegistrationTokenValidator } from '@/lib/registration-token-validator'
import type { RegistrationTokenData } from '@/lib/registration-token-validator'
import { supabase } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PhoneInput } from './phone-input'
import { useReferralValidation } from '@/features/users/hooks/use-referral-validation'

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
      .regex(/^[a-zA-Z0-9_]+$/, { message: 'Solo letras, números y guiones bajos' }),
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
  const searchParams = useSearch({ from: '/(auth)/register' }) as { token?: string, ref?: string }

  // Validar token de registro al cargar el componente
  useEffect(() => {
    const validateRegistrationToken = async () => {
      setValidatingToken(true)
      
      // Obtener el token y el código de referido de la URL
      const token = searchParams.token
      const refCode = searchParams.ref
      
      console.log("Parámetros recibidos:", { token, refCode });
      
      // Verificar si el registro está permitido
      const registrationCheck = await RegistrationTokenValidator.isRegistrationAllowed(token)
      
      if (!registrationCheck.allowed) {
        setRegistrationAllowed(false)
        setErrorMessage(registrationCheck.reason || 'Acceso no autorizado')
        setValidatingToken(false)
        return
      }

      // Si el código de referido viene en la URL, lo agregamos a los datos del token
      if (refCode) {
        console.log("Se detectó código de referido en URL:", refCode);
        
        // Asignamos el código de referido a los datos del token
        registrationCheck.data!.referralCode = refCode;
        console.log("Datos del token actualizados:", registrationCheck.data);
        
        // Validar que el código de referido sea válido
        try {
          const referidoUsuario = await UsersService.validateReferralCode(refCode);
          if (referidoUsuario) {
            console.log("Usuario referido validado:", referidoUsuario);
          } else {
            console.warn("Código de referido no válido:", refCode);
            // Mantenemos el código aunque sea inválido para mostrar el error
          }
        } catch (err) {
          console.error("Error validando código de referido:", err);
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

  // Actualizar valores cuando cambien los datos del token
  useEffect(() => {
    if (tokenData) {
      // Actualizar el rol siempre
      form.setValue('rol', tokenData.role as 'registered' | 'provider' | 'seller')
      
      // Actualizar el código de referido si existe
      if (tokenData.referralCode) {
        console.log("Actualizando formulario con código de referido:", tokenData.referralCode);
        form.setValue('codigoReferido', tokenData.referralCode)
      }
    }
  }, [tokenData, form])

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)
    try {
      console.log('Registrando usuario con referido:', values)

      // Extraer el código de referido de los valores
      const { codigoReferido, confirmPassword, rol, ...userData } = values

      console.log('Datos del usuario a crear:', {
        ...userData,
        rol: rol || 'registered' // Usar el rol del link o 'registered' por defecto
      })
      console.log('Código de referido:', codigoReferido)

      // Crear el usuario usando el servicio correcto
      const newUser = await UsersService.createUserWithReferral(
        {
          email: userData.email,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          usuario: userData.usuario,
          password: userData.password,
          telefono: userData.telefono,
          rol: rol || 'registered' // Usar el rol del link
        },
        codigoReferido // Código del referente (viene del enlace)
      )

      console.log('Usuario creado exitosamente:', newUser)

      // Invalidar el token de registro después del uso exitoso
      if (tokenData?.validationToken) {
        await RegistrationTokenValidator.invalidateToken(tokenData.validationToken)
      }

      // Esperar un poco antes de intentar el login
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Después de crear el usuario exitosamente, iniciar sesión automáticamente
      console.log('Intentando login automático con:', userData.email)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      })

      if (signInError) {
        console.error('Error al iniciar sesión automáticamente:', signInError)
        console.error('Detalles del error:', signInError.message)

        // Manejo específico de diferentes tipos de errores
        if (signInError.message.includes('Email not confirmed') || signInError.message.includes('confirmation')) {
          toast.success('¡Registro exitoso!', {
            description: 'Tu cuenta ha sido creada. El administrador te concederá acceso a la plataforma.'
          })
        } else if (signInError.message.includes('Invalid login credentials')) {
          toast.success('¡Registro exitoso!', {
            description: 'Tu cuenta ha sido creada correctamente. Puedes iniciar sesión con tus credenciales.'
          })
        } else {
          toast.success('¡Registro exitoso!', {
            description: 'Tu cuenta ha sido creada correctamente. Por favor inicia sesión.'
          })
        }
        navigate({ to: '/sign-in' })
      } else {
        console.log('Inicio de sesión automático exitoso:', signInData)
        toast.success('¡Bienvenido!', {
          description: 'Tu cuenta ha sido creada y has iniciado sesión exitosamente.'
        })

        // Verificar el rol del usuario para redirigir correctamente
        const userRole = signInData.user?.user_metadata?.rol || tokenData?.role || 'registered'
        console.log('Rol del usuario:', userRole)

        // Redirigir según el rol del usuario
        let dashboardRoute = '/dashboard'
        if (userRole === 'admin') {
          dashboardRoute = '/admin'
        } else if (userRole === 'seller') {
          dashboardRoute = '/vendedor'
        } else if (userRole === 'provider') {
          dashboardRoute = '/proveedor'
        }

        console.log('Redirigiendo a:', dashboardRoute)
        navigate({ to: dashboardRoute })
      }

    } catch (error: any) {
      console.error('Error en el registro:', error)
      toast.error('Error en el registro', {
        description: error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostrar loading mientras se valida el token
  if (validatingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <div>
                <h3 className="font-semibold">Validando token de registro</h3>
                <p className="text-sm text-muted-foreground">
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
              <div>
                <h3 className="font-semibold text-destructive">Acceso Denegado</h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/sign-in">Ir al Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="gap-8 max-w-sm mx-auto h-screen flex flex-col justify-center px-6 md:px-0">
      <div className="flex items-center flex-col gap-2">
        <img
          src={logoImage}
          alt="Logo"
          className="h-12 w-auto"
        />
        <div className="text-center">
          <h2 className="text-xl font-bold">
            Registro por Invitación
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              Invitación Verificada
            </span>
          </div>
        </div>
      </div>

      {/* Mostrar información del referido si existe */}
      {tokenData?.referralCode && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <Badge variant="secondary">
                Código de Referido: {tokenData.referralCode}
              </Badge>
              <Badge variant="outline">
                Rol Asignado: {tokenData.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form} >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Nombres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Apellidos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="usuario"
            render={({ field }) => (
              <FormItem>

                <FormControl>
                  <Input placeholder="Usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhoneInput {...field} defaultCountry="PE" placeholder="Teléfono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput placeholder="Contraseña" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput placeholder="Repite tu contraseña" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {tokenData?.referralCode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Código de Referido:</Label>
                <Badge className='font-mono'>
                  {tokenData.referralCode}
                </Badge>
              </div>
              {/* Validación del código de referido proporcionado en la URL */}
              <ReferralCodeValidator code={tokenData.referralCode} />
              <FormField
                control={form.control}
                name="codigoReferido"
                render={() => (
                  <input 
                    type="hidden" 
                    value={tokenData.referralCode}
                    {...form.register('codigoReferido')} 
                  />
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="codigoReferido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Referido (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: ABC123 (opcional)"
                      {...field}
                    />
                  </FormControl>
                  {field.value && field.value.trim() !== '' && (
                    <OptionalReferralCodeValidator code={field.value} />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className='flex flex-col mt-8'>
            <Button
              type="submit"
              className="w-full col-span-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Cuenta"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Button variant="link" className='p-0' asChild>
                <Link to="/sign-in" className="underline">
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

// Componente para validar códigos de referido
function ReferralCodeValidator({ code }: { code: string }) {
  const { isValid, isLoading, referentName, validateCode } = useReferralValidation();
  const [lastValidatedCode, setLastValidatedCode] = useState('');
  
  useEffect(() => {
    if (code && code.trim() !== '' && code.trim() !== lastValidatedCode) {
      console.log("Validando código de referido:", code.trim());
      validateCode(code.trim());
      setLastValidatedCode(code.trim());
    }
  }, [code, validateCode, lastValidatedCode]);
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> 
        Validando código de referido...
      </div>
    );
  }
  
  if (isValid === false) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <AlertTriangle className="h-3 w-3" /> 
        Código de referido no válido
      </div>
    );
  }
  
  if (isValid && referentName) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <ShieldCheck className="h-3 w-3" /> 
        Referido por: {referentName}
      </div>
    );
  }
  
  return null;
}

// Componente para validar códigos de referido opcionales con debouncing
function OptionalReferralCodeValidator({ code }: { code: string }) {
  const { isValid, isLoading, referentName, validateCode } = useReferralValidation();
  const [debouncedCode, setDebouncedCode] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce del código ingresado
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedCode(code.trim());
    }, 500); // Esperar 500ms después de que deje de escribir

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [code]);

  // Validar cuando cambie el código debounced
  useEffect(() => {
    if (debouncedCode && debouncedCode !== '') {
      console.log("Validando código opcional con debounce:", debouncedCode);
      validateCode(debouncedCode);
    }
  }, [debouncedCode, validateCode]);

  if (!debouncedCode || debouncedCode === '') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> 
        Validando código de referido...
      </div>
    );
  }
  
  if (isValid === false) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <AlertTriangle className="h-3 w-3" /> 
        Código de referido no válido
      </div>
    );
  }
  
  if (isValid && referentName) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <ShieldCheck className="h-3 w-3" /> 
        Referido por: {referentName}
      </div>
    );
  }
  
  return null;
}
