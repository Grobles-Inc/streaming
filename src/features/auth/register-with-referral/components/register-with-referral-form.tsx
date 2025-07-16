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
    // Campo para el código de referido PROPIO del usuario
    codigoReferidoPropio: z
      .string()
      .optional()
      .transform((val) => val ? val.replace(/\s+/g, '') : val) // Eliminar espacios
      .refine((val) => !val || val.length >= 3, {
        message: 'El código debe tener al menos 3 caracteres',
      })
      .refine((val) => !val || /^[a-zA-Z0-9_]+$/.test(val), {
        message: 'Solo letras, números y guiones bajos',
      }),
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
  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean
    isDuplicate: boolean
    message: string
  }>({ isChecking: false, isDuplicate: false, message: '' })
  const [usernameValidation, setUsernameValidation] = useState<{
    isChecking: boolean
    isDuplicate: boolean
    message: string
  }>({ isChecking: false, isDuplicate: false, message: '' })
  const [codigoValidation, setCodigoValidation] = useState<{
    isChecking: boolean
    isDuplicate: boolean
    message: string
  }>({ isChecking: false, isDuplicate: false, message: '' })
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const codigoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  // Cleanup timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current)
      }
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current)
      }
      if (codigoTimeoutRef.current) {
        clearTimeout(codigoTimeoutRef.current)
      }
    }
  }, [])

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
      codigoReferidoPropio: '',
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

  // Función para validar email en tiempo real
  const validateEmailUnique = async (email: string) => {
    if (!email || email.length < 3) {
      setEmailValidation({ isChecking: false, isDuplicate: false, message: '' })
      return
    }

    setEmailValidation({ isChecking: true, isDuplicate: false, message: '' })

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, estado_habilitado')
        .eq('email', email.toLowerCase())
        .eq('estado_habilitado', true) // Solo considerar usuarios habilitados
        .maybeSingle()

      if (error) {
        console.error('Error checking email:', error)
        setEmailValidation({ 
          isChecking: false, 
          isDuplicate: false, 
          message: 'Error verificando email' 
        })
        return
      }

      if (data) {
        setEmailValidation({ 
          isChecking: false, 
          isDuplicate: true, 
          message: 'Este email ya está registrado' 
        })
        form.setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado'
        })
      } else {
        setEmailValidation({ 
          isChecking: false, 
          isDuplicate: false, 
          message: '' 
        })
        // Limpiar error si el email está disponible
        if (form.formState.errors.email?.message === 'Este email ya está registrado') {
          form.clearErrors('email')
        }
      }
    } catch (err) {
      console.error('Error in email validation:', err)
      setEmailValidation({ 
        isChecking: false, 
        isDuplicate: false, 
        message: 'Error verificando email' 
      })
    }
  }

  // Función para validar username en tiempo real
  const validateUsernameUnique = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameValidation({ isChecking: false, isDuplicate: false, message: '' })
      return
    }

    setUsernameValidation({ isChecking: true, isDuplicate: false, message: '' })

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, estado_habilitado')
        .eq('usuario', username.toLowerCase())
        .eq('estado_habilitado', true) // Solo considerar usuarios habilitados
        .maybeSingle()

      if (error) {
        console.error('Error checking username:', error)
        setUsernameValidation({ 
          isChecking: false, 
          isDuplicate: false, 
          message: 'Error verificando usuario' 
        })
        return
      }

      if (data) {
        setUsernameValidation({ 
          isChecking: false, 
          isDuplicate: true, 
          message: 'Este nombre de usuario ya está en uso' 
        })
        form.setError('usuario', {
          type: 'manual',
          message: 'Este nombre de usuario ya está en uso'
        })
      } else {
        setUsernameValidation({ 
          isChecking: false, 
          isDuplicate: false, 
          message: '' 
        })
        // Limpiar error si el username está disponible
        if (form.formState.errors.usuario?.message === 'Este nombre de usuario ya está en uso') {
          form.clearErrors('usuario')
        }
      }
    } catch (err) {
      console.error('Error in username validation:', err)
      setUsernameValidation({ 
        isChecking: false, 
        isDuplicate: false, 
        message: 'Error verificando usuario' 
      })
    }
  }

  // Función para validar código de referido propio en tiempo real
  const validateCodigoPropio = async (codigo: string) => {
    if (!codigo || codigo.length < 3) {
      setCodigoValidation({ isChecking: false, isDuplicate: false, message: '' })
      return
    }

    // Eliminar espacios y mantener el caso original
    const codigoLimpio = codigo.replace(/\s+/g, '')
    
    if (codigoLimpio.length < 3) {
      setCodigoValidation({ isChecking: false, isDuplicate: false, message: '' })
      return
    }

    setCodigoValidation({ isChecking: true, isDuplicate: false, message: '' })

    try {
      // Verificar si el código ya existe EXACTAMENTE como está escrito en la columna codigo_referido
      const { data: existingCodes, error: codesError } = await supabase
        .from('usuarios')
        .select('id, codigo_referido, nombres, apellidos, estado_habilitado')
        .eq('codigo_referido', codigoLimpio) // Sin convertir a minúsculas, buscar exacto
        .eq('estado_habilitado', true)
        .limit(1)

      if (codesError) {
        console.error('Error checking codigo_referido uniqueness:', codesError)
        setCodigoValidation({ 
          isChecking: false, 
          isDuplicate: false, 
          message: 'Error verificando código' 
        })
        return
      }

      // Si encontramos el código como codigo_referido de alguien más
      if (existingCodes && existingCodes.length > 0) {
        
        setCodigoValidation({ 
          isChecking: false, 
          isDuplicate: true, 
          message: `Este código ya está en uso.` 
        })
        form.setError('codigoReferidoPropio', {
          type: 'manual',
        })
        return
      }

      // Si llegamos aquí, el código está disponible
      setCodigoValidation({ 
        isChecking: false, 
        isDuplicate: false, 
        message: 'Código disponible' 
      })
      // Limpiar error si el código está disponible
      if (form.formState.errors.codigoReferidoPropio?.message === 'Este código ya está en uso') {
        form.clearErrors('codigoReferidoPropio')
      }

    } catch (err) {
      console.error('Error in codigo validation:', err)
      setCodigoValidation({ 
        isChecking: false, 
        isDuplicate: false, 
        message: 'Error verificando código' 
      })
    }
  }

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)
    
    // Limpiar errores previos de campos específicos
    form.clearErrors(['email', 'usuario'])
    
    // Verificar si hay errores de validación de código duplicado
    if (codigoValidation.isDuplicate) {
      toast.error('Error en el registro', {
        description: 'Por favor corrige los errores antes de continuar'
      })
      setIsLoading(false)
      return
    }

    // Verificar si hay errores en el formulario
    if (Object.keys(form.formState.errors).length > 0) {
      toast.error('Error en el registro', {
        description: 'Por favor corrige todos los errores antes de continuar'
      })
      setIsLoading(false)
      return
    }
    
    try {
      console.log('Registrando usuario con referido:', values)

      // Extraer el código de referido de los valores
      const { codigoReferido, codigoReferidoPropio, confirmPassword, rol, ...userData } = values

      // Limpiar espacios del código propio antes de enviarlo
      const codigoLimpio = codigoReferidoPropio ? codigoReferidoPropio.replace(/\s+/g, '') : undefined

      console.log('Datos del usuario a crear:', {
        ...userData,
        codigo_referido: codigoLimpio || null, // Código propio del usuario limpio
        rol: rol || 'registered' // Usar el rol del link o 'registered' por defecto
      })
      console.log('Código de referido del referente:', codigoReferido)
      console.log('Código propio del usuario:', codigoLimpio)

      // Crear el usuario usando el servicio correcto
      const newUser = await UsersService.createUserWithReferral(
        {
          email: userData.email,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          usuario: userData.usuario,
          password: userData.password,
          telefono: userData.telefono,
          codigo_referido: codigoLimpio || undefined, // Código propio del usuario limpio
          rol: rol || 'registered' // Usar el rol del link
        },
        codigoReferido // Código del referente (viene del enlace)
      )

      console.log('Usuario creado exitosamente:', newUser)

      // DESHABILITADO: No invalidar tokens porque ahora son permanentes
      // Los tokens solo se invalidan cuando se regeneran explícitamente
      // if (tokenData?.validationToken) {
      //   await RegistrationTokenValidator.invalidateToken(tokenData.validationToken)
      // }

      // Mostrar mensaje de éxito y redirigir al login
      toast.success('¡Registro exitoso!', {
        description: 'Tu cuenta ha sido creada correctamente. Por favor inicia sesión con tus credenciales.'
      })
      
      // Redirigir al login
      navigate({ to: '/sign-in' })

    } catch (error: any) {
      console.error('Error en el registro:', error)
      
      // Manejo específico de errores de validación de campo
      const errorMessage = error.message || error.toString()
      
      // Errores de email duplicado en la tabla usuarios
      if (errorMessage.includes('duplicate key value violates unique constraint') && 
          (errorMessage.includes('usuarios_email_key') || errorMessage.includes('email'))) {
        form.setError('email', {
          type: 'manual',
          message: 'Este email ya está registrado'
        })
        return
      }
      
      // Errores de usuario duplicado en la tabla usuarios
      if (errorMessage.includes('duplicate key value violates unique constraint') && 
          errorMessage.includes('usuario')) {
        form.setError('usuario', {
          type: 'manual',
          message: 'Este nombre de usuario ya está en uso'
        })
        return
      }
      
      // Errores de validación de email por formato
      if (errorMessage.includes('invalid input syntax') && errorMessage.includes('email')) {
        form.setError('email', {
          type: 'manual',
          message: 'Formato de email inválido'
        })
        return
      }
      
      // Error genérico para otros casos
      toast.error('Error en el registro', {
        description: errorMessage.includes('Código de referido') 
          ? errorMessage 
          : 'No se pudo crear la cuenta. Inténtalo de nuevo.'
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
                  <Input 
                    placeholder="Usuario" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e)
                      
                      // Debounce username validation
                      if (usernameTimeoutRef.current) {
                        clearTimeout(usernameTimeoutRef.current)
                      }
                      usernameTimeoutRef.current = setTimeout(() => {
                        validateUsernameUnique(e.target.value)
                      }, 800)
                    }}
                  />
                </FormControl>
                {usernameValidation.isChecking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando disponibilidad...
                  </div>
                )}
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
            name="codigoReferidoPropio"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Tu código de referido (opcional)" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e)
                      
                      // Debounce codigo validation
                      if (codigoTimeoutRef.current) {
                        clearTimeout(codigoTimeoutRef.current)
                      }
                      codigoTimeoutRef.current = setTimeout(() => {
                        validateCodigoPropio(e.target.value)
                      }, 800)
                    }}
                  />
                </FormControl>
                {codigoValidation.isChecking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando disponibilidad...
                  </div>
                )}
                {codigoValidation.message && !codigoValidation.isChecking && (
                  <div className={`text-xs ${codigoValidation.isDuplicate ? 'text-red-500' : 'text-green-600'}`}>
                    {codigoValidation.message}
                  </div>
                )}
                <FormMessage />
                <div className="text-xs text-muted-foreground">
                  Crea tu propio código único para referir a otros usuarios
                </div>
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
                    onChange={(e) => {
                      field.onChange(e)
                      
                      // Debounce email validation
                      if (emailTimeoutRef.current) {
                        clearTimeout(emailTimeoutRef.current)
                      }
                      emailTimeoutRef.current = setTimeout(() => {
                        validateEmailUnique(e.target.value)
                      }, 800)
                    }}
                  />
                </FormControl>
                {emailValidation.isChecking && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Verificando disponibilidad...
                  </div>
                )}
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
