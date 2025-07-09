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
import { retirarFondosSchema, type RetirarFondos } from '../data/schema'
import { useAuth } from '@/stores/authStore'
import { useConfiguracionSistema } from '@/features/proveedor/productos/queries'
import { useCreateRetiro } from '../queries'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useIsMobile } from '@/hooks/use-mobile'
import { RetiroMessage } from '@/lib/whatsapp'

interface RetirarFondosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  saldoDisponible: number
}

export function RetirarFondosModal({
  open,
  onOpenChange,
  onSubmit,
  saldoDisponible
}: RetirarFondosModalProps) {
  const { user } = useAuth()
  const { data: configuracion } = useConfiguracionSistema()
  const { mutate: crearRetiro, isPending } = useCreateRetiro()
  const isMobile = useIsMobile()

  // Obtener tasa de conversión y comisión de la configuración del sistema
  const tasaConversion = configuracion?.conversion || 3.7
  const comisionPorcentaje = configuracion?.comision || 10 // Comisión del administrador en %

  const form = useForm<RetirarFondos>({
    resolver: zodResolver(retirarFondosSchema),
    defaultValues: {
      cantidad: 0,
    },
  })

  // Observar el valor de cantidad en soles para calcular USD y comisiones
  const cantidadSolesValue = form.watch('cantidad')

  // Cálculos
  const calculosRetiro = useMemo(() => {
    if (!cantidadSolesValue || cantidadSolesValue <= 0) {
      return {
        valorEnDolares: 0,
        comisionDolares: 0,
        montoNetoUsuario: 0,
        suficienteSaldo: true
      }
    }

    const valorEnDolares = parseFloat((cantidadSolesValue / tasaConversion).toFixed(2))
    const comisionDolares = parseFloat((valorEnDolares * (comisionPorcentaje / 100)).toFixed(2))
    const montoNetoUsuario = parseFloat((valorEnDolares - comisionDolares).toFixed(2))
    const suficienteSaldo = valorEnDolares <= saldoDisponible

    return {
      valorEnDolares,
      comisionDolares,
      montoNetoUsuario,
      suficienteSaldo
    }
  }, [cantidadSolesValue, tasaConversion, comisionPorcentaje, saldoDisponible])

  const handleSubmit = async (data: RetirarFondos) => {
    if (!user) return

    try {
      // El valor que se retira de la billetera es el total en dólares
      // (la comisión se maneja en el backend)
      await crearRetiro({
        monto: calculosRetiro.valorEnDolares,
        usuario_id: user.id,
        estado: 'pendiente',
        // Metadatos adicionales para el procesamiento
        monto_soles: data.cantidad,
        comision_admin: calculosRetiro.comisionDolares
      })

      form.reset()
      onOpenChange(false)
      onSubmit() // Esto disparará la refetch de los datos

      // Enviar mensaje de WhatsApp inmediatamente
      RetiroMessage({
        usuario: user?.usuario || '',
        monto_soles: data.cantidad,
        monto_dolares: calculosRetiro.valorEnDolares,
        monto_neto: calculosRetiro.montoNetoUsuario,
        comision: calculosRetiro.comisionDolares,
        id_cliente: user?.id || '',
      }, '51913190401', isMobile ? 'mobile' : 'web')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Formateo de montos
  const saldoFormateadoDolares = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(saldoDisponible)

  const saldoEquivalenteSoles = new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(saldoDisponible * tasaConversion)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Retirar Fondos</DialogTitle>
          <DialogDescription>
            Ingresa la cantidad en soles para calcular automáticamente el valor en dólares y la comisión
          </DialogDescription>
        </DialogHeader>

        {/* Información del saldo disponible */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo disponible:</span>
            <div className="text-right">
              <span className="font-semibold text-lg text-blue-600">{saldoFormateadoDolares}</span>
              <div className="text-xs text-muted-foreground">
                Equivale a {saldoEquivalenteSoles}
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a retirar (S/)</FormLabel>
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
                    value={`$${calculosRetiro.valorEnDolares} USD`}
                    disabled
                    className="bg-blue-50 font-semibold text-blue-700"
                  />
                </FormControl>
              </FormItem>
            </div>

            {/* Desglose de comisiones si hay cantidad */}
            {calculosRetiro.valorEnDolares > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-orange-800">Comisión del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Comisión ({comisionPorcentaje}%):</span>
                        <span className="font-semibold text-orange-700">
                          ${calculosRetiro.comisionDolares} USD
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-800">Monto que Recibirás</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monto neto:</span>
                        <span className="font-semibold text-green-700">
                          ${calculosRetiro.montoNetoUsuario} USD
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Equivale a S/ {((calculosRetiro.montoNetoUsuario * tasaConversion).toFixed(2))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Alertas de validación */}
            {!calculosRetiro.suficienteSaldo && calculosRetiro.valorEnDolares > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Saldo insuficiente. El monto solicitado excede tu saldo disponible.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Información importante */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Información del Retiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs md:text-sm font-semibold">Detalles del retiro:</p>
                  <p className="text-xs md:text-sm">• Se aplicará una comisión del {comisionPorcentaje}% sobre el monto.</p>
                  <p className="text-xs md:text-sm">• El dinero será retirado via comunicación previa con el administrador.</p>
                  <p className="text-xs md:text-sm mt-4 font-semibold">Para mayor información comunicarse al:</p>
                  <p className="text-xs md:text-sm font-semibold">+51 913 190 401</p>
                </CardContent>
              </Card>

              {/* Métodos de retiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Métodos de Retiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Yape **</p>
                    <p className="text-xs md:text-sm">Retiros hasta S/ 500</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Transferencia Bancaria **</p>
                    <p className="text-xs md:text-sm">Para montos mayores</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Binance **</p>
                    <p className="text-xs md:text-sm">USDT disponible</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Soporte</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center">
                  <div className="text-center">
                    <p className="text-xs md:text-sm mb-2">¿Necesitas ayuda?</p>
                    <p className="text-xs md:text-sm font-semibold text-green-600">+51 913 190 401</p>
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
                disabled={isPending || calculosRetiro.valorEnDolares <= 0 || !calculosRetiro.suficienteSaldo}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className='size-4 animate-spin mr-2' />
                    Procesando...
                  </>
                ) : (
                  'Solicitar Retiro'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 