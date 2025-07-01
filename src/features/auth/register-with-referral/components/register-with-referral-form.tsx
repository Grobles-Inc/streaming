import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { IconUserPlus, IconCheck } from '@tabler/icons-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

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
      .refine((val) => !val || val.length >= 9, {
        message: 'El teléfono debe tener al menos 9 dígitos',
      }),
    password: z
      .string()
      .min(1, { message: 'La contraseña es requerida' })
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z.string(),
    // Campos bloqueados que vienen del link
    codigoReferido: z.string(),
    rol: z.enum(['registrado', 'provider', 'seller']),
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
    const ref = searchParams.get('ref')
    const role = searchParams.get('role')
    
    if (!ref || !role) {
      toast.error('Link de invitación inválido')
      navigate({ to: '/sign-up' })
      return
    }
    
    setUrlParams({ ref, role })
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
      rol: (urlParams.role as 'registrado' | 'provider' | 'seller') || 'registrado',
    },
  })

  // Actualizar valores cuando cambien los parámetros URL
  useEffect(() => {
    if (urlParams.ref && urlParams.role) {
      form.setValue('codigoReferido', urlParams.ref)
      form.setValue('rol', urlParams.role as 'registrado' | 'provider' | 'seller')
    }
  }, [urlParams, form])

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Aquí implementarías la lógica de registro con Supabase
      console.log('Registrando usuario:', values)
      
      // Simulación de registro
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('¡Registro exitoso!', {
        description: 'Tu cuenta ha sido creada correctamente.'
      })
      
      // Redirigir al login o dashboard
      navigate({ to: '/sign-in' })
      
    } catch (error) {
      toast.error('Error en el registro', {
        description: 'No se pudo crear la cuenta. Inténtalo de nuevo.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'registrado':
        return 'Registrado'
      case 'provider':
        return 'Proveedor'
      case 'seller':
        return 'Vendedor'
      default:
        return role
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'registrado':
        return 'Usuario básico con acceso limitado al sistema'
      case 'provider':
        return 'Podrás crear y gestionar productos en la plataforma'
      case 'seller':
        return 'Podrás vender productos existentes y gestionar tus ventas'
      default:
        return 'Tendrás que esperar asignación de rol por parte del administrador.'
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
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <IconUserPlus className="h-6 w-6" />
            Registro por Invitación
          </CardTitle>
          <CardDescription>
            Has sido invitado a unirte a la plataforma. Completa tu información para crear tu cuenta.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información de la invitación */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Código de Referido:</span>
                  <Badge variant="outline" className="font-mono">
                    {urlParams.ref}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rol Asignado:</span>
                  <Badge variant="secondary">
                    {getRoleDisplayName(urlParams.role)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getRoleDescription(urlParams.role)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Formulario de registro */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Carlos" {...field} />
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
                      <FormLabel>Apellidos *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: García López" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="usuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de Usuario *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: jgarcia123" {...field} />
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
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 999123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Ej: juan.garcia@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña *</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Mínimo 8 caracteres" {...field} />
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
                      <FormLabel>Confirmar Contraseña *</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="Repite tu contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

             
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Creando cuenta...'
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Crear Cuenta
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <a 
              href="/sign-in" 
              className="underline underline-offset-4 hover:text-primary"
            >
              Inicia sesión aquí
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
