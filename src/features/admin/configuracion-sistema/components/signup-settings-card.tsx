import { useEffect, useState } from 'react'
import { SIGNUP_MODES, type SignupMode } from '@/types/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  getSignupSettings,
  updateSignupSettings,
} from '@/features/auth/api/signup-settings'

const MODE_LABELS: Record<SignupMode, { title: string; description: string }> =
  {
    open: {
      title: 'Abierto',
      description:
        'Cualquiera puede crear una cuenta de vendedor desde /sign-up.',
    },
    invite: {
      title: 'Solo invitación',
      description:
        '/sign-up queda deshabilitado. Solo se registran con un link de invitación válido.',
    },
    closed: {
      title: 'Cerrado',
      description:
        'No se puede registrar nadie. Las invitaciones existentes también dejan de funcionar.',
    },
  }

/**
 * Global signup switch.
 *
 * Self contained on purpose: every other card on this page saves through
 * ConfiguracionService, which INSERTs a new row instead of updating the one
 * these switches are read from. Sharing that save path would make the toggle
 * appear to do nothing.
 */
export function SignupSettingsCard() {
  const [mode, setMode] = useState<SignupMode | null>(null)
  const [approvalRequired, setApprovalRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let disposed = false

    getSignupSettings({ force: true }).then((settings) => {
      if (disposed) return
      setMode(settings.mode)
      setApprovalRequired(settings.approvalRequired)
      setLoading(false)
    })

    return () => {
      disposed = true
    }
  }, [])

  async function handleSave() {
    if (!mode) return

    setSaving(true)
    const saved = await updateSignupSettings({
      mode,
      approvalRequired,
    })
    setSaving(false)

    if (saved) {
      toast.success('Configuración de registro actualizada')
    } else {
      toast.error('Error al guardar la configuración de registro')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de usuarios</CardTitle>
        <CardDescription>
          Decide quién puede crear una cuenta y si necesita aprobación.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='signup-mode'>Estado del registro</Label>
          <Select
            value={mode ?? undefined}
            onValueChange={(value) => setMode(value as SignupMode)}
            disabled={loading || saving}
          >
            <SelectTrigger id='signup-mode' className='w-full'>
              <SelectValue placeholder={loading ? 'Cargando...' : undefined} />
            </SelectTrigger>
            <SelectContent>
              {SIGNUP_MODES.map((value) => (
                <SelectItem key={value} value={value}>
                  {MODE_LABELS[value].title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {mode && (
            <p className='text-muted-foreground text-sm'>
              {MODE_LABELS[mode].description}
            </p>
          )}
        </div>

        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <Label htmlFor='registro-aprobacion'>
              Requerir aprobación del administrador
            </Label>
            <p className='text-muted-foreground text-sm'>
              Las cuentas nuevas se crean deshabilitadas y no pueden iniciar
              sesión hasta que las actives desde la tabla de usuarios.
            </p>
          </div>
          <Switch
            id='registro-aprobacion'
            checked={approvalRequired}
            onCheckedChange={setApprovalRequired}
            disabled={loading || saving}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || saving || !mode}
          size='sm'
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </CardContent>
    </Card>
  )
}
