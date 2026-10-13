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
import { useAuth } from '@/stores/authStore'
import { Copy, Loader2, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { useCompras } from '../context/compras-context'
import { Compra } from '../data/schema'
import { useRequestCode } from '../queries'
import { ImapNeedsConfigError } from '../services/imap'

interface ComprasCodigoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

export function ComprasCodigoDialog({
  open,
  onOpenChange,
  currentRow,
}: ComprasCodigoDialogProps) {
  const { user } = useAuth()
  const { setOpen } = useCompras()
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
  const code = req.data?.codigo ?? ''
  const slotCount = code.length >= 4 && code.length <= 8 ? code.length : 6

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Obtener código</DialogTitle>
          <DialogDescription>
            {currentRow.stock_productos?.email
              ? `Buscando código de verificación para ${currentRow.stock_productos.email}`
              : 'Buscando código de verificación'}
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center gap-6 py-4'>
          {req.isPending ? (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='size-8 animate-spin' />
              <p className='text-muted-foreground text-sm'>
                Conectando con el correo...
              </p>
            </div>
          ) : needsConfig ? (
            <div className='flex flex-col items-center gap-3'>
              <MailWarning className='size-8' />
              <p className='text-center text-sm'>
                Esta cuenta no tiene IMAP configurado.
              </p>
              <Button onClick={() => setOpen('config_imap')}>
                Configurar IMAP
              </Button>
            </div>
          ) : req.error ? (
            <div className='flex flex-col items-center gap-3'>
              <p className='text-center text-sm'>{req.error.message}</p>
              <Button onClick={handleRetry}>Reintentar</Button>
            </div>
          ) : (
            <>
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
              {req.data?.remitente && (
                <p className='text-muted-foreground text-center text-sm'>
                  De: {req.data.remitente}
                </p>
              )}
              <Button
                variant='outline'
                onClick={handleCopy}
                disabled={!code}
              >
                <Copy className='size-4' />
                Copiar
              </Button>
            </>
          )}
          <div className='flex justify-end gap-2 self-stretch'>
            <Button variant='outline' onClick={handleClose}>
              Cerrar
            </Button>
            {!needsConfig && !req.isPending && req.error && (
              <Button onClick={handleRetry}>Reintentar</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
