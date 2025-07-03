import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMailPlus, IconCopy, IconCheck, IconEye, IconLink, IconX, IconLoader } from '@tabler/icons-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useReferralValidation } from '../hooks/use-referral-validation'

const formSchema = z.object({
  referralCode: z.string().min(1, { message: 'Código de referido es requerido.' }),
})
type UserInviteForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para generar el link de invitación
function generateInviteLink(referralCode: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/register?ref=${referralCode}&role=registered`
}

export function UsersInviteDialog({ open, onOpenChange }: Props) {
  const { isValid, isLoading, referentName, validateCode, reset } = useReferralValidation()
  const [inviteLink, setInviteLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  
  const form = useForm<UserInviteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { referralCode: '' },
  })

  const watchedReferralCode = form.watch('referralCode')

  // Validar código y generar link cuando cambie
  useEffect(() => {
    if (watchedReferralCode) {
      const timeoutId = setTimeout(() => {
        validateCode(watchedReferralCode)
      }, 500) // Debounce de 500ms

      return () => clearTimeout(timeoutId)
    } else {
      reset()
      setInviteLink('')
    }
  }, [watchedReferralCode, validateCode, reset])

  // Generar link cuando el código sea válido
  useEffect(() => {
    if (isValid && watchedReferralCode) {
      const link = generateInviteLink(watchedReferralCode)
      setInviteLink(link)
    } else {
      setInviteLink('')
    }
  }, [isValid, watchedReferralCode])

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
    if (!isValid) {
      form.setError('referralCode', {
        message: 'Código de referido inválido'
      })
      return
    }

    if (inviteLink) {
      toast.success('Link de invitación generado correctamente')
      // Aquí podrías guardar la invitación en la base de datos si es necesario
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        reset()
        setInviteLink('')
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
            Crea un link personalizado que incluya un código de referido.
            El nuevo usuario se registrará automáticamente con rol de "registered".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-invite-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='referralCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de referido</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder='Ej: ABC123'
                        {...field}
                        className={`pr-10 ${
                          isValid === true 
                            ? 'border-green-500 focus:border-green-500' 
                            : isValid === false 
                            ? 'border-red-500 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {isLoading ? (
                          <IconLoader className="h-4 w-4 text-gray-400 animate-spin" />
                        ) : isValid === true ? (
                          <IconCheck className="h-4 w-4 text-green-500" />
                        ) : isValid === false ? (
                          <IconX className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </FormControl>
                  {referentName && isValid && (
                    <p className="text-sm text-green-600">
                      Referente: {referentName}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Vista previa del link generado */}
            {inviteLink && (
              <>
                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconLink className="h-4 w-4" />
                      Link de Invitación Generado
                    </CardTitle>
                    <CardDescription>
                      Comparte este link para que el nuevo usuario se registre con el referido incluido.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyLink}
                        className="shrink-0"
                      >
                        {copied ? (
                          <IconCheck className="h-4 w-4" />
                        ) : (
                          <IconCopy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleOpenLink}
                        className="shrink-0"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        Código: {watchedReferralCode}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Rol: registered
                      </Badge>
                      {referentName && (
                        <Badge variant="default" className="text-xs">
                          Por: {referentName}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </form>
        </Form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancelar</Button>
          </DialogClose>
          {inviteLink && (
            <Button 
              type='submit' 
              form='user-invite-form'
              disabled={!isValid || isLoading}
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Confirmar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
