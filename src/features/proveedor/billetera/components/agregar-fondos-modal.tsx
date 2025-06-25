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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { agregarFondosSchema, type AgregarFondos } from '../data/schema'
import { useAuth } from '@/stores/authStore'

// Importar servicio directo para crear recargas
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AgregarFondosModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function AgregarFondosModal({ open, onOpenChange, onSubmit }: AgregarFondosModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const form = useForm<AgregarFondos>({
    resolver: zodResolver(agregarFondosSchema),
    defaultValues: {
      cantidad: 0,
      metodo_pago: 'transferencia',
    },
  })

  const handleSubmit = async (data: AgregarFondos) => {
    if (!user) {
      toast.error('Debe estar autenticado para agregar fondos')
      return
    }

    setIsLoading(true)
    try {
      // Crear una nueva recarga en la base de datos
      const { error } = await supabase
        .from('recargas')
        .insert({
          usuario_id: user.id,
          monto: data.cantidad,
          metodo_pago: data.metodo_pago,
          estado: 'pendiente' // Las recargas empiezan como pendientes hasta ser aprobadas
        })

      if (error) {
        console.error('Error creating recarga:', error)
        toast.error('Error al procesar la recarga')
        return
      }

      toast.success('Recarga creada correctamente. Será procesada en breve.')
      form.reset()
      onOpenChange(false)
      onSubmit() // Esto disparará la refetch de los datos
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al agregar fondos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💰 Agregar Fondos</DialogTitle>
          <DialogDescription>
            Selecciona la cantidad y el método de pago para agregar fondos a tu billetera
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad a agregar</FormLabel>
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

              <FormField
                control={form.control}
                name="metodo_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="pse">PSE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Primer bloque - Pasos para recargar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">¿Pasos para recargar?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs md:text-sm">1. Ingresa el monto a recargar.</p>
                  <p className="text-xs md:text-sm">2. Yapea, Plinea o Transferir el importe recargado.</p>
                  <p className="text-xs md:text-sm mt-4">Para mayor información comunicarse al:</p>
                  <p className="text-xs md:text-sm font-semibold">+51 941 442 792</p>
                </CardContent>
              </Card>

              {/* Segundo bloque - Métodos de pago */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Métodos de pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Plin **</p>
                    <p className="text-xs md:text-sm">+51 941 442 792</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">** Binance **</p>
                    <p className="text-xs md:text-sm">ID: 1096171177</p>
                    <p className="text-xs md:text-sm">Nombre: Melvy L</p>
                    <p className="text-xs md:text-sm">1 USDT = 3.5 soles</p>
                  </div>
                </CardContent>
              </Card>

              {/* Tercer bloque - QR */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Código QR</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Procesando...' : 'Solicitar Recarga'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}