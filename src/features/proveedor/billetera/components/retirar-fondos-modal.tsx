import { useState } from 'react'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { retirarFondosSchema, type RetirarFondos } from '../data/schema'
import { AlertTriangle } from 'lucide-react'

interface RetirarFondosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RetirarFondos) => void
  saldoDisponible: number
}

export function RetirarFondosModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  saldoDisponible 
}: RetirarFondosModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RetirarFondos>({
    resolver: zodResolver(retirarFondosSchema.refine(
      (data) => data.cantidad <= saldoDisponible,
      {
        message: 'La cantidad no puede ser mayor al saldo disponible',
        path: ['cantidad']
      }
    )),
    defaultValues: {
      cantidad: 0,
    },
  })

  const watchedCantidad = form.watch('cantidad')

  const handleSubmit = async (data: RetirarFondos) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Error al retirar fondos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saldoFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(saldoDisponible)

  const cantidadFormateada = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(watchedCantidad || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Retirar Fondos</DialogTitle>
          <DialogDescription>
            Retira fondos de tu billetera. El dinero será transferido a tu cuenta bancaria registrada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Saldo disponible:</span>
              <span className="font-semibold text-lg">{saldoFormateado}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a retirar</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ingresa la cantidad"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                    {watchedCantidad > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Cantidad a retirar: <span className="font-medium">{cantidadFormateada}</span>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {watchedCantidad > saldoDisponible && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    La cantidad a retirar no puede ser mayor al saldo disponible.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Información importante:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• El retiro será procesado en 1-3 días hábiles</li>
                    <li>• Se aplicará una comisión del 2% sobre el monto retirado</li>
                    <li>• El dinero será transferido a tu cuenta bancaria registrada</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || watchedCantidad <= 0 || watchedCantidad > saldoDisponible}
                  variant="destructive"
                >
                  {isLoading ? 'Procesando...' : 'Retirar Fondos'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 