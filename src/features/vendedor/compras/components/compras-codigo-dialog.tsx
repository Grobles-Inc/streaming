import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/stores/authStore'
import { Ban, Copy, Loader2, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Compra } from '../data/schema'
import { useRequestCode } from '../queries'
import { ImapNeedsConfigError, ImapNotEnabledError } from '../services/imap'

interface ComprasCodigoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

const formatRecibido = (iso: string | null): string | null => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ComprasCodigoDialog({
  open,
  onOpenChange,
  currentRow,
}: ComprasCodigoDialogProps) {
  const { user } = useAuth()
  const req = useRequestCode()
  const firedRef = useRef<number | null>(null)

  const compraId = currentRow.id

  useEffect(() => {
    if (!open) {
      firedRef.current = null
      req.reset()
      return
    }
    if (!compraId || !user?.id) return
    if (firedRef.current === compraId) return
    firedRef.current = compraId
    req.mutate({ compraId, userId: user.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, compraId])

  const handleRetry = () => {
    if (!compraId || !user?.id) return
    req.mutate({ compraId, userId: user.id })
  }

  const handleCopy = async () => {
    if (!req.data?.codigo) return
    try {
      await navigator.clipboard.writeText(req.data.codigo)
      toast.success('Código copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const needsConfig = req.error instanceof ImapNeedsConfigError
  const notEnabled = req.error instanceof ImapNotEnabledError
  const code = req.data?.codigo ?? ''
  const slotCount = code.length >= 4 && code.length <= 8 ? code.length : 6
  const recibido = formatRecibido(req.data?.recibido_at ?? null)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Obtener código</DialogTitle>
          <DialogDescription>
            {currentRow.stock_productos?.email
              ? `Buscando código de verificación para ${currentRow.stock_productos.email}`
              : 'Buscando código de verificación'}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-2'>
          {req.isPending ? (
            <div className='flex flex-col items-center gap-2 py-6'>
              <Loader2 className='size-8 animate-spin' />
              <p className='text-muted-foreground text-sm'>
                Conectando con el correo...
              </p>
            </div>
          ) : needsConfig ? (
            <div className='flex flex-col items-center gap-3 py-6'>
              <MailWarning className='size-8' />
              <p className='text-sm font-medium'>Correo sin configurar</p>
              <p className='text-center text-sm'>{req.error?.message}</p>
              <p className='text-muted-foreground text-center text-sm'>
                El proveedor debe configurar el acceso al correo de esta
                cuenta desde Pedidos.
              </p>
            </div>
          ) : notEnabled ? (
            <div className='flex flex-col items-center gap-3 py-6'>
              <Ban className='size-8' />
              <p className='text-sm font-medium'>Obtención no habilitada</p>
              <p className='text-center text-sm'>{req.error?.message}</p>
              <p className='text-muted-foreground text-center text-sm'>
                El proveedor debe habilitar la obtención desde Pedidos.
              </p>
            </div>
          ) : req.error ? (
            <div className='flex flex-col items-center gap-3 py-6'>
              <p className='text-center text-sm'>{req.error.message}</p>
              <Button onClick={handleRetry}>Reintentar</Button>
            </div>
          ) : (
            <>
              <div className='flex flex-col items-center gap-3'>
                <InputOTP
                  maxLength={slotCount}
                  value={code}
                  onChange={() => {}}
                >
                  <InputOTPGroup>
                    {Array.from({ length: slotCount }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button variant='outline' onClick={handleCopy} disabled={!code}>
                  <Copy className='size-4' />
                  Copiar
                </Button>
              </div>
              <Separator />
              <dl className='grid gap-1 text-sm'>
                {req.data?.remitente && (
                  <div className='flex gap-2'>
                    <dt className='text-muted-foreground w-16 shrink-0'>
                      De
                    </dt>
                    <dd className='break-all'>{req.data.remitente}</dd>
                  </div>
                )}
                {req.data?.asunto && (
                  <div className='flex gap-2'>
                    <dt className='text-muted-foreground w-16 shrink-0'>
                      Asunto
                    </dt>
                    <dd className='break-words'>{req.data.asunto}</dd>
                  </div>
                )}
                {recibido && (
                  <div className='flex gap-2'>
                    <dt className='text-muted-foreground w-16 shrink-0'>
                      Recibido
                    </dt>
                    <dd>{recibido}</dd>
                  </div>
                )}
              </dl>
              {req.data?.cuerpo && (
                <ScrollArea className='max-h-64 rounded-md border'>
                  <p className='text-sm break-words whitespace-pre-wrap'>
                    {req.data.cuerpo}
                  </p>
                </ScrollArea>
              )}
            </>
          )}
          <div className='flex justify-end'>
            <Button variant='outline' onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
