import { useEffect, useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { Compra } from '../data/schema'

interface ComprasCodigoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Compra
}

const MOCK_CODE = '482913'

export function ComprasCodigoDialog({
  open,
  onOpenChange,
  currentRow,
}: ComprasCodigoDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    setCode('')
    const timer = setTimeout(() => {
      setCode(MOCK_CODE)
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [open, currentRow.id])

  const handleRetry = () => {
    setIsLoading(true)
    setCode('')
    setTimeout(() => {
      setCode(MOCK_CODE)
      setIsLoading(false)
    }, 2000)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

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
          {isLoading ? (
            <div className='flex flex-col items-center gap-2'>
              <Loader2 className='size-8 animate-spin' />
              <p className='text-muted-foreground text-sm'>
                Conectando con el correo...
              </p>
            </div>
          ) : (
            <>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className='text-muted-foreground text-center text-sm'>
                Código de demostración. Sin conexión al backend.
              </p>
            </>
          )}
          <div className='flex justify-end gap-2 self-stretch'>
            <Button variant='outline' onClick={handleClose}>
              Cerrar
            </Button>
            <Button onClick={handleRetry} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                'Reintentar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
