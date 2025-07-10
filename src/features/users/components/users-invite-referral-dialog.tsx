import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMailPlus, IconCopy, IconCheck, IconEye, IconLink, IconLoader, IconRefresh } from '@tabler/icons-react'
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useUsersContext } from '../context/users-context'
import { encryptReferralData } from '@/lib/encryption'
import { ConfigurationService } from '@/services/configuration.service'

const formSchema = z.object({
  referralUserId: z.string().min(1, { message: 'Debe seleccionar un usuario para referido.' }),
  role: z.enum(['registered', 'provider', 'seller'], { message: 'Debe seleccionar un rol válido.' }),
})

type InviteForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para generar el link de invitación seguro con token de validación
async function generateSecureInviteLink(referralCode: string, role: string): Promise<string | null> {
  try {
    // Generar token de validación único
    const validationToken = ConfigurationService.generateRegistrationToken()
    
    // Almacenar el token en la base de datos
    const tokenStored = await ConfigurationService.storeRegistrationToken(validationToken)
    
    if (!tokenStored) {
      throw new Error('No se pudo almacenar el token de validación')
    }

    const baseUrl = window.location.origin
    // Encriptar con código de referido, rol y token de validación
    const encryptedData = encryptReferralData(referralCode, role, validationToken)

    return `${baseUrl}/register?token=${encryptedData}`
  } catch (error) {
    console.error('Error generando link seguro:', error)
    return null
  }
}

export function UsersInviteWithReferralDialog({ open, onOpenChange }: Props) {
  const { users } = useUsersContext()
  const [inviteLink, setInviteLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [generatingLink, setGeneratingLink] = useState(false)

  const form = useForm<InviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      referralUserId: '', 
      role: 'registered' 
    },
  })

  const watchedValues = form.watch()

  // Generar el link cuando cambien los valores
  useEffect(() => {
    const generateLink = async () => {
      if (watchedValues.referralUserId && watchedValues.role) {
        const user = users.find(u => u.id === watchedValues.referralUserId)
        if (user) {
          setSelectedUser(user)
          setGeneratingLink(true)
          const link = await generateSecureInviteLink(user.codigo_referido, watchedValues.role)
          setInviteLink(link || '')
          setGeneratingLink(false)
        }
      } else {
        setInviteLink('')
        setSelectedUser(null)
      }
    }

    generateLink()
  }, [watchedValues.referralUserId, watchedValues.role, users])

  const handleCopyLink = async () => {
    if (inviteLink) {
      try {
        await navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success('Link copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Error al copiar el link')
      }
    }
  }

  const handleOpenLink = () => {
    if (inviteLink) {
      window.open(inviteLink, '_blank')
    }
  }

  const onSubmit = () => {
    if (inviteLink) {
      toast.success('Link de invitación generado correctamente')
      // Aquí podrías guardar la invitación en la base de datos si es necesario
    }
  }

  // Filtrar usuarios que tengan código de referido (incluyendo admins)
  const availableUsers = users.filter(user => 
    user.codigo_referido && 
    user.codigo_referido.trim() !== ''
  )

  // Encontrar el usuario administrador para establecerlo como referente por defecto
  const adminUser = users.find(user => user.rol === 'admin')

  // Establecer el admin como valor por defecto cuando se abra el diálogo
  useEffect(() => {
    if (open && adminUser && !form.getValues('referralUserId')) {
      form.setValue('referralUserId', adminUser.id)
    }
  }, [open, adminUser, form])

  const roleOptions = [
    { value: 'registered', label: 'Registrado', description: 'Usuario básico con acceso limitado al sistema' },
    { value: 'provider', label: 'Proveedor', description: 'Puede crear y gestionar productos' },
    { value: 'seller', label: 'Vendedor', description: 'Puede vender productos existentes' },
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        setInviteLink('')
        setSelectedUser(null)
        setCopied(false)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-left'>
          <DialogTitle className='flex items-center gap-2'>
            <IconMailPlus className="h-5 w-5" />
            Generar Link de Invitación con Referido
          </DialogTitle>
          <DialogDescription>
            Crea un link personalizado que incluya un código de referido de un usuario existente.
            El nuevo usuario se registrará automáticamente con este código.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='invite-referral-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            {/* Selector de usuario para referido */}
            <FormField
              control={form.control}
              name='referralUserId'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Usuario Referente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el usuario que será el referente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex-1">
                              <div className="font-medium">
                                {user.nombres} {user.apellidos}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {user.codigo_referido}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {user.rol}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {availableUsers.length === 0 && (
                    <p className="text-sm text-amber-600">
                      No hay usuarios disponibles con código de referido.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Selector de rol para el nuevo usuario */}
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='space-y-2'>
                  <FormLabel>Rol del Nuevo Usuario</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el rol para el nuevo usuario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            {/* <span className="text-sm text-muted-foreground">
                              {role.description}
                            </span> */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vista previa del usuario seleccionado */}
            {/* {selectedUser && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <IconUser className="h-4 w-4" />
                    Usuario Referente Seleccionado
                  </h4>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {selectedUser.nombres} {selectedUser.apellidos}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedUser.email}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {selectedUser.codigo_referido}
                          </Badge>
                          <Badge variant="secondary">
                            {selectedUser.rol}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )} */}

            {/* Link generado */}
            {(generatingLink || inviteLink) && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <IconLink className="h-4 w-4" />
                    Link de Invitación Generado
                  </h4>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Link de Registro Seguro</CardTitle>
                      <CardDescription>
                        Comparte este link con la persona que quieres invitar. El link incluye un token de seguridad.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {generatingLink ? (
                        <div className="flex items-center justify-center py-4">
                          <IconLoader className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">Generando link seguro...</span>
                        </div>
                      ) : (
                        <>
                          {/* Link input y acciones principales */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                value={inviteLink}
                                readOnly
                                className="font-mono text-sm flex-1"
                                placeholder="Generando link seguro..."
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCopyLink}
                                className="flex items-center gap-1 shrink-0"
                                disabled={!inviteLink || generatingLink}
                              >
                                {copied ? (
                                  <IconCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <IconCopy className="h-4 w-4" />
                                )}
                                {copied ? 'Copiado' : 'Copiar'}
                              </Button>
                            </div>
                            
                            {/* Botones secundarios */}
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleOpenLink}
                                className="flex items-center gap-1"
                                disabled={!inviteLink || generatingLink}
                              >
                                <IconEye className="h-4 w-4" />
                                Ver Link
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"                              onClick={async () => {
                                setGeneratingLink(true)
                                setInviteLink('')
                                setCopied(false)
                                if (selectedUser && watchedValues.role) {
                                  const link = await generateSecureInviteLink(selectedUser.codigo_referido, watchedValues.role)
                                  setInviteLink(link || '')
                                }
                                setGeneratingLink(false)
                              }}
                                className="flex items-center gap-1"
                                disabled={generatingLink}
                              >
                                <IconRefresh className="h-4 w-4" />
                                Regenerar Token
                              </Button>
                            </div>
                          </div>
                          
                          {/* Información del link generado */}
                          {/* <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Badge variant="outline" className="text-xs justify-center py-1">
                                Código: {selectedUser?.codigo_referido}
                              </Badge>
                              <Badge variant="secondary" className="text-xs justify-center py-1">
                                Rol: {roleOptions.find(r => r.value === watchedValues.role)?.label}
                              </Badge>
                            </div>
                            
                          </div> */}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </form>
        </Form>

        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cerrar</Button>
          </DialogClose>
          {inviteLink && !generatingLink && (
            <Button type='submit' form='invite-referral-form'>
              <IconCheck className="h-4 w-4 mr-2" />
              Confirmar Invitación
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
