import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { agregarFondosSchema, type AgregarFondos } from '../data/schema'
import { useAuth } from '@/stores/authStore'
import { useIsMobile } from '@/hooks/use-mobile'
import { RecargaMessage } from '@/lib/whatsapp'
import { useCreateRecarga } from '@/features/vendedor/recargas/queries'
import { useConfiguracionSistema } from '@/features/proveedor/productos/queries'
import { Loader2 } from 'lucide-react'
import YapeQRImage from '@/assets/YapeQR.jpg'

interface AgregarFondosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function AgregarFondosModal({ open, onOpenChange, onSubmit }: AgregarFondosModalProps) {
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const { mutate: crearRecarga, isPending } = useCreateRecarga()
  
  // Obtener la tasa de conversión de la configuración del sistema
  const { data: configuracion } = useConfiguracionSistema()
  const tasaConversion = configuracion?.conversion || 3.7 // Fallback a 3.7 si no hay configuración

  const form = useForm<AgregarFondos>({
    resolver: zodResolver(agregarFondosSchema),
    defaultValues: {
      cantidad: 0,
    },
  })

  // Observar el valor de cantidad para calcular USD
  const cantidadValue = form.watch('cantidad')
  const valorEnDolares = useMemo(() => {
    if (!cantidadValue || cantidadValue <= 0) return 0
    return parseFloat((cantidadValue / tasaConversion).toFixed(2))
  }, [cantidadValue, tasaConversion])

  const handleSubmit = async (data: AgregarFondos) => {
    if (!user) {
      return
    }

    try {
      // Calcular el monto en dólares que se agregará a la billetera
      const montoEnDolares = parseFloat((data.cantidad / tasaConversion).toFixed(2))
      
      await crearRecarga({
        monto: montoEnDolares, // Guardar el valor en dólares
        usuario_id: user.id,
        estado: 'pendiente'
      })
      form.reset()
      onOpenChange(false)
      onSubmit() // Esto disparará la refetch de los datos
      
      // Enviar mensaje de WhatsApp inmediatamente
      RecargaMessage({
        nombre_cliente: user?.nombres + ' ' + user?.apellidos || '',
        monto: data.cantidad, // En el mensaje se muestra el monto en soles
        id_cliente: user?.id || '',
      }, '51913190401', isMobile ? 'mobile' : 'web')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Fondos</DialogTitle>
          <DialogDescription>
            Ingresa la cantidad en soles para calcular automáticamente el valor en dólares
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a agregar (S/)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ingresa la cantidad"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Tasa de cambio</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={`S/ ${tasaConversion} = $1 USD`}
                    disabled
                    className="bg-gray-50"
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Valor en dólares</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={`$${valorEnDolares} USD`}
                    disabled
                    className="bg-blue-50 font-semibold text-blue-700"
                  />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primer bloque - Pasos para recargar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">¿Pasos para recargar?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs md:text-sm">1. Ingresa el monto a recargar.</p>
                  <p className="text-xs md:text-sm">2. Yapea, Plinea el importe recargado.</p>
                  <p className="text-xs md:text-sm mt-4">Para mayor información comunicarse al:</p>
                  <p className="text-xs md:text-sm font-semibold">+51 913 190 401</p>
                </CardContent>
              </Card>

              {/* Segundo bloque - Métodos de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Métodos de pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Yape **</p>
                    <p className="text-xs md:text-sm">+51 913 190 401</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Binance **</p>
                    <p className="text-xs md:text-sm">ID: 977731480</p>
                    <p className="text-xs md:text-sm">Nombre: Juan M.</p>
                    <p className="text-xs md:text-sm">1 USDT = 3.5 soles</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tercer bloque - QR */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Yape QR</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center p-2">
                    <img src={YapeQRImage} alt="Imagen de QR de Yape" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm font-semibold">Juan Laura P.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className='size-4 animate-spin mr-2' />
                    Procesando...
                  </>
                ) : (
                  'Solicitar Recarga'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}