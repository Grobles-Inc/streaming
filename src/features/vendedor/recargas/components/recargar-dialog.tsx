import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { useIsMobile } from '@/hooks/use-mobile'
import { RecargaMessage } from '@/lib/whatsapp'
import { asBinanceInfo, asYapeInfo, DEFAULT_BINANCE_INFO, DEFAULT_YAPE_INFO } from '@/lib/recarga-info'
import { useAuth } from '@/stores/authStore'
import { IconPlus } from '@tabler/icons-react'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { useConfiguracionSistema, useCreateRecarga } from '../queries'
import { convertMonto, type RecargaFormValues } from '../data/schema'
import { MontoField } from './monto-field'
import YapeQRImage from '@/assets/YapeQR.jpg'

export function RecargarDialog() {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [methodModal, setMethodModal] = React.useState<'yape' | 'binance' | null>(null)
  const { mutate: crearRecarga, isPending } = useCreateRecarga()
  const { data: configuracion } = useConfiguracionSistema()
  const conversion = configuracion?.conversion
  const tasa = conversion && conversion > 0 ? conversion : null
  const form = useForm<RecargaFormValues>({
    defaultValues: {
      divisa: 'PEN',
    },
  })

  const yapeInfo = configuracion ? asYapeInfo(configuracion.yape_info) : DEFAULT_YAPE_INFO
  const binanceInfo = configuracion ? asBinanceInfo(configuracion.binance_info) : DEFAULT_BINANCE_INFO
  const commPhone = yapeInfo.comm_phone || DEFAULT_YAPE_INFO.comm_phone || '51913190401'
  const qrSrc = yapeInfo.qr_url || YapeQRImage

  if (!user?.id) {
    return null
  }

  async function onSubmit(data: RecargaFormValues) {
    if (tasa === null) return

    const amount = Number(data.amount) || 0
    const montoUsd = convertMonto(amount, data.divisa, 'USD', tasa)
    const montoPen = convertMonto(amount, data.divisa, 'PEN', tasa)

    try {
      setDialogOpen(false)
      await crearRecarga({
        monto: montoUsd,
        usuario_id: user?.id as string,
      })
      form.reset({ divisa: 'PEN' })
      setDialogOpen(false)
      const audio = new Audio('/src/assets/sound/yape.mp3')
      audio.play()
      setTimeout(() => {
        RecargaMessage({
          usuario: user?.usuario || '',
          monto: montoPen,
          id_cliente: user?.id || '',
        }, commPhone, isMobile ? 'mobile' : 'web')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }
  return (
    <>
      <Button className='mr-2'
        onClick={() => setDialogOpen(true)}
      >
        <IconPlus />
        Recargar
      </Button>


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Recargar Saldo
            </DialogTitle>
            <DialogDescription className='hidden md:block'>
              Recarga tu saldo con los diferentes medios de pago
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className='space-y-2'>
                <MontoField form={form} tasa={tasa} />
                <div className='flex justify-end'>
                  <a href={`https://wa.me/${commPhone}`} target="_blank" className='flex items-center gap-1 '>
                    <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-5' />
                    <span className='text-green-500 underline text-xs'>{commPhone}</span>
                  </a>
                </div>
              </div>


<div className='flex flex-wrap items-center gap-2'>
                <Button type="button" variant="outline" onClick={() => setMethodModal('yape')}>
                  Yape
                </Button>
                <Button type="button" variant="outline" onClick={() => setMethodModal('binance')}>
                  Binance
                </Button>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending || tasa === null}>
                  {isPending ? <Loader2 className='size-4 animate-spin' /> : 'Solicitar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={methodModal !== null} onOpenChange={(open) => !open && setMethodModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {methodModal === 'yape' ? 'Información de Yape' : 'Información de Binance'}
            </DialogTitle>
            <DialogDescription>
              {methodModal === 'yape'
                ? 'Escanea el QR o yapea al número indicado.'
                : 'Escanea el QR o envía el pago a la cuenta indicada.'}
            </DialogDescription>
          </DialogHeader>
          {methodModal === 'yape' && (
            <div className='flex flex-col items-center gap-4'>
              <img src={qrSrc} alt="Yape" className='md:size-52 size-28 object-contain' />
              <div className='flex flex-col gap-1 text-center'>
                <p className="text-xs">
                  <strong className='text-base'>{yapeInfo.yape_number}</strong>
                  <br />
                  {yapeInfo.yape_name}
                </p>
                <a href={`https://wa.me/${commPhone}`} target="_blank" className='flex items-center justify-center gap-1'>
                  <img src="https://img.icons8.com/?size=200&id=BkugfgmBwtEI&format=png&color=000000" className='size-5' />
                  <span className='text-green-500 underline text-xs'>{commPhone}</span>
                </a>
              </div>
            </div>
          )}
          {methodModal === 'binance' && (
            <div className='flex flex-col items-center gap-4'>
              {binanceInfo.qr_url && (
                <img src={binanceInfo.qr_url} alt="Binance" className='md:size-52 size-28 object-contain' />
              )}
              <div className='flex flex-col gap-2 text-sm text-center'>
                <p className="font-bold">Binance</p>
                <p>ID: {binanceInfo.binance_id}</p>
                <p>Nombre: {binanceInfo.binance_name}</p>
                <p>1 USDT = {binanceInfo.usdt_rate} soles</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMethodModal(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}