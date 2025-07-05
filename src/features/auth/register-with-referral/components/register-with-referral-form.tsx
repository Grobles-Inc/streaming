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
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UsersService } from '@/features/users/services/users.service'
import { decryptReferralData } from '@/lib/encryption'
import { supabase } from '@/lib/supabase'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PhoneInput } from './phone-input'

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

interface URLParams {
  ref?: string // código de referido
  role?: string // rol asignado
}


export function RegisterWithReferralForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [urlParams, setUrlParams] = useState<URLParams>({})
  const navigate = useNavigate()

  // Obtener parámetros de la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const encryptedData = searchParams.get('data')

    if (!encryptedData) {
      toast.error('Link de invitación inválido')
      navigate({ to: '/sign-up' })
      return
    }

    // Desencriptar los datos de referido (código + rol)
    const decryptedData = decryptReferralData(encryptedData)

    if (!decryptedData) {
      toast.error('Datos de invitación inválidos')
      navigate({ to: '/sign-up' })
      return
    }

    setUrlParams({ ref: decryptedData.referralCode, role: decryptedData.role })
  }, [navigate])

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
      codigoReferido: urlParams.ref || '',
      rol: (urlParams.role as 'registered' | 'provider' | 'seller') || 'registered',
    },
  })

  // Actualizar valores cuando cambien los parámetros URL
  useEffect(() => {
    if (urlParams.ref && urlParams.role) {
      form.setValue('codigoReferido', urlParams.ref)
      form.setValue('rol', urlParams.role as 'registered' | 'provider' | 'seller')
    }
  }, [urlParams, form])

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
        const userRole = signInData.user?.user_metadata?.rol || urlParams.role || 'registered'
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

  if (!urlParams.ref || !urlParams.role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">Cargando...</p>
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
        <h2 className=" text-xl font-bold">
          Registro por Invitación
        </h2>
      </div>

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
          <div className="flex items-center justify-between">
            <Label>Código de Referido:</Label>
            <Badge className='font-mono'>
              {urlParams.ref}
            </Badge>
          </div>
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
