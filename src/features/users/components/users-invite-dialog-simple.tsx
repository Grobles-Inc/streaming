import { useState, useEffect } from 'react'
import { ConfigurationService } from '@/services/configuration.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconCopy, IconLink, IconRefresh } from '@tabler/icons-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({ open, onOpenChange }: Props) {
  const [inviteLink, setInviteLink] = useState<string>('')
  const [referralCode, setReferralCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Función simple para obtener el link de invitación
  const generateLink = async (withReferral: string = '') => {
    setLoading(true)
    try {
      // SOLO obtener el token de la BD, nunca generar uno nuevo
      const token = await ConfigurationService.getCurrentToken()
      
      if (!token) {
        toast.error('No hay token configurado. Contacta al administrador para configurar el sistema.')
        console.error('No hay token en la base de datos')
        return
      }
      
      console.log('Usando token permanente de BD:', token)

      const baseUrl = window.location.origin
      let link = `${baseUrl}/register?token=${token}`
      
      if (withReferral.trim()) {
        link += `&ref=${encodeURIComponent(withReferral.trim())}`
      }
      
      setInviteLink(link)
      console.log('Link generado:', link)
      
    } catch (error) {
      console.error('Error generando link:', error)
      toast.error('Error al generar el link de invitación')
    } finally {
      setLoading(false)
    }
  }

  // Copiar al portapapeles
  const copyToClipboard = async () => {
    if (!inviteLink) return
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success('Link copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar el link')
    }
  }

  // Generar token completamente nuevo
  const regenerateToken = async () => {
    setLoading(true)
    try {
      const newToken = await ConfigurationService.regenerateInvitationToken()
      if (newToken) {
        toast.success('Token regenerado exitosamente')
        // Regenerar el link con el nuevo token
        generateLink(referralCode)
      } else {
        toast.error('Error al regenerar el token')
      }
    } catch (error) {
      console.error('Error regenerando token:', error)
      toast.error('Error al regenerar el token')
    } finally {
      setLoading(false)
    }
  }

  // Cargar link al abrir el diálogo
  useEffect(() => {
    if (open) {
      generateLink(referralCode)
    }
  }, [open])

  // Regenerar link cuando cambie el código de referido  
  useEffect(() => {
    if (open && inviteLink) {
      generateLink(referralCode)
    }
  }, [referralCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconLink className="h-5 w-5" />
            Generar Link de Invitación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campo para código de referido opcional */}
          <div className="space-y-2">
            <Label htmlFor="referral-code">Código de Referido (Opcional)</Label>
            <Input
              id="referral-code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Ingresa un código de referido"
            />
          </div>

          {/* Link generado */}
          {inviteLink && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Link de Invitación Generado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    <IconCopy className="h-4 w-4" />
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => generateLink(referralCode)}
              disabled={loading}
              variant="outline"
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : 'Actualizar Link'}
            </Button>
            
            <Button
              onClick={regenerateToken}
              disabled={loading}
              variant="destructive"
            >
              Crear/Regenerar Token
            </Button>
          </div>

          {/* Información */}
          <div className="text-sm text-muted-foreground">
            <p>• El link es permanente hasta que regeneres el token</p>
            <p>• Múltiples personas pueden usar el mismo link</p>
            <p>• Solo regenera el token si quieres invalidar todos los links anteriores</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
