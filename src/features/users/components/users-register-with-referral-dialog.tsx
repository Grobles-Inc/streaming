import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconUserPlus, IconCheck, IconX, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { UsersService } from '../services/users.service'
import type { SupabaseUser } from '../services/users.service'

const formSchema = z.object({
  nombres: z.string().min(1, { message: 'Los nombres son requeridos.' }),
  apellidos: z.string().min(1, { message: 'Los apellidos son requeridos.' }),
  email: z
    .string()
    .min(1, { message: 'El email es requerido.' })
    .email({ message: 'El email no es válido.' }),
  usuario: z.string().min(3, { message: 'El usuario debe tener al menos 3 caracteres.' }),
  telefono: z.string().optional(),
  codigoReferido: z.string().min(1, { message: 'El código de referido es requerido.' }),
})

type RegisterForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersRegisterWithReferralDialog({ open, onOpenChange, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [validatingCode, setValidatingCode] = useState(false)
  const [referralUser, setReferralUser] = useState<SupabaseUser | null>(null)
  const [codeValidated, setCodeValidated] = useState<boolean | null>(null)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      nombres: '',
      apellidos: '',
      email: '',
      usuario: '',
      telefono: '',
      codigoReferido: ''
    },
  })

  // Validar código de referido mientras el usuario escribe
  const handleReferralCodeChange = async (codigo: string) => {
    if (codigo.length >= 10) { // Asumiendo que los códigos tienen 10 caracteres
      setValidatingCode(true)
      setCodeValidated(null)
      setReferralUser(null)

      try {
        const user = await UsersService.validateReferralCode(codigo)
        if (user) {
          setReferralUser(user)
          setCodeValidated(true)
          toast.success(`Código válido - Usuario: ${user.nombres} ${user.apellidos}`)
        } else {
          setCodeValidated(false)
          toast.error('Código de referido no válido')
        }
      } catch (error) {
        setCodeValidated(false)
        toast.error('Error al validar el código de referido')
      } finally {
        setValidatingCode(false)
      }
    } else {
      setCodeValidated(null)
      setReferralUser(null)
    }
  }

  const onSubmit = async (values: RegisterForm) => {
    if (!codeValidated || !referralUser) {
      toast.error('Por favor, valida el código de referido antes de continuar')
      return
    }

    setIsLoading(true)
    try {
      // Generar usuario automáticamente si no se proporciona
      const usuarioFinal = values.usuario || `${values.nombres}${values.apellidos}`.toLowerCase().replace(/\s+/g, '')

      await UsersService.createUserWithReferral(
        {
          email: values.email,
          nombres: values.nombres,
          apellidos: values.apellidos,
          usuario: usuarioFinal,
          telefono: values.telefono || null,
          password: 'defaultPassword123', // Deberías implementar generación de password o envío por email
          rol: 'registered' // Siempre asignar rol de registrado
        },
        values.codigoReferido
      )

      toast.success('Usuario registrado exitosamente con código de referido')
      form.reset()
      setReferralUser(null)
      setCodeValidated(null)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error registering user:', error)
      toast.error(error instanceof Error ? error.message : 'Error al registrar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUserPlus className="h-5 w-5" />
            Registrar Usuario con Referido
          </DialogTitle>
          <DialogDescription>
            Registra un nuevo usuario usando un código de referido. El rol asignado será siempre "registrado".
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* Información personal */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name='nombres'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese los nombres" {...field} />
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
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese los apellidos" {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@email.com" {...field} />
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
                    <FormLabel>Usuario *</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre_usuario" {...field} />
                    </FormControl>
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
                      <Input placeholder="+51 999 999 999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Código de referido */}
            <FormField
              control={form.control}
              name='codigoReferido'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Referido *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Ingrese el código de referido" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleReferralCodeChange(e.target.value)
                        }}
                        className={
                          codeValidated === true 
                            ? 'border-green-500 pr-10' 
                            : codeValidated === false 
                            ? 'border-red-500 pr-10' 
                            : ''
                        }
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validatingCode && <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {!validatingCode && codeValidated === true && <IconCheck className="h-4 w-4 text-green-600" />}
                        {!validatingCode && codeValidated === false && <IconX className="h-4 w-4 text-red-600" />}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información del usuario referente */}
            {referralUser && codeValidated && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-800">Usuario Referente Encontrado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">
                      {referralUser.nombres} {referralUser.apellidos}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {referralUser.rol}
                    </Badge>
                  </div>
                  <div className="text-sm text-green-700">
                    {referralUser.email}
                  </div>
                  <div className="text-xs text-green-600">
                    Código: {referralUser.codigo_referido}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>Nota:</strong> El usuario será registrado con rol "registrado" automáticamente.
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isLoading || !codeValidated}
                className="gap-2"
              >
                {isLoading && <IconLoader2 className="h-4 w-4 animate-spin" />}
                Registrar Usuario
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
