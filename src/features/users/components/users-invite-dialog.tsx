import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMailPlus, IconCopy, IconCheck, IconEye, IconLink, IconX, IconLoader } from '@tabler/icons-react'
import { encryptReferralData } from '@/lib/encryption'
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
  referralCode: z.string().optional(),
})
type UserInviteForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Función para generar el link de invitación con código y rol encriptados
function generateInviteLink(referralCode?: string): string {
  const baseUrl = window.location.origin
  if (referralCode) {
    const encryptedData = encryptReferralData(referralCode, 'registered')
    return `${baseUrl}/register?data=${encryptedData}`
  } else {
    return `${baseUrl}/register`
  }
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
  const hasReferralCode = watchedReferralCode && watchedReferralCode.trim() !== ''

  // Validar código y generar link cuando cambie
  useEffect(() => {
    if (hasReferralCode) {
      const timeoutId = setTimeout(() => {
        validateCode(watchedReferralCode!)
      }, 500) // Debounce de 500ms

      return () => clearTimeout(timeoutId)
    } else {
      reset()
      // Generar link sin código de referido
      const link = generateInviteLink()
      setInviteLink(link)
    }
  }, [watchedReferralCode, hasReferralCode, validateCode, reset])

  // Generar link cuando el código sea válido o cuando no hay código
  useEffect(() => {
    if (hasReferralCode && isValid) {
      const link = generateInviteLink(watchedReferralCode!)
      setInviteLink(link)
    } else if (!hasReferralCode) {
      const link = generateInviteLink()
      setInviteLink(link)
    } else if (hasReferralCode && !isValid) {
      setInviteLink('')
    }
  }, [isValid, watchedReferralCode, hasReferralCode])

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
    if (hasReferralCode && !isValid) {
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
            Generar Link de Invitación
          </DialogTitle>
          <DialogDescription>
            Crea un link personalizado para invitar usuarios. El código de referido es opcional.
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
                  <FormLabel>Código de referido (opcional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder='Ej: ABC123 (opcional)'
                        {...field}
                        className={`pr-10 ${
                          hasReferralCode && isValid === true 
                            ? 'border-green-500 focus:border-green-500' 
                            : hasReferralCode && isValid === false 
                            ? 'border-red-500 focus:border-red-500' 
                            : ''
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {hasReferralCode && isLoading ? (
                          <IconLoader className="h-4 w-4 text-gray-400 animate-spin" />
                        ) : hasReferralCode && isValid === true ? (
                          <IconCheck className="h-4 w-4 text-green-500" />
                        ) : hasReferralCode && isValid === false ? (
                          <IconX className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  </FormControl>
                  {referentName && isValid && hasReferralCode && (
                    <p className="text-sm text-green-600">
                      Referente: {referentName}
                    </p>
                  )}
                  {!hasReferralCode && (
                    <p className="text-sm text-blue-600">
                      Sin código de referido - Invitación general
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
                      {hasReferralCode && (
                        <>
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
                        </>
                      )}
                      {!hasReferralCode && (
                        <Badge variant="secondary" className="text-xs">
                          Invitación general - Sin referido
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
              disabled={hasReferralCode && !isValid || isLoading}
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
