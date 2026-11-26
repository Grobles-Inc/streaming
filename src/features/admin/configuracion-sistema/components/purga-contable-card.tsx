import { useState } from 'react'
import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePurgaContable } from '../hooks/use-purga-contable'

const DIAS_POR_DEFECTO = 60
const DIAS_MINIMO = 30

const toNumber = (value: number | string | null) => {
  const parsed = Number(value ?? 0)
  return Number.isNaN(parsed) ? 0 : parsed
}

const formatUSD = (amount: number | string | null) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(toNumber(amount))
}

export function PurgaContableCard() {
  const { ultimaPurga, loading, purging, purgar } = usePurgaContable()
  const [dias, setDias] = useState(DIAS_POR_DEFECTO)

  const diasValidos = Math.max(dias, DIAS_MINIMO)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purga Contable</CardTitle>
        <CardDescription>
          Elimina recargas y retiros antiguos. Antes de borrar se archivan los
          totales, así el balance y los reportes no se descuadran.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Días de antigüedad</label>
          <Input
            type='number'
            min={DIAS_MINIMO}
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            onBlur={() => setDias(diasValidos)}
            className='w-32'
            disabled={purging}
          />
        </div>

        {loading ? (
          <Skeleton className='h-20 w-full' />
        ) : ultimaPurga ? (
          <div className='space-y-1 rounded-md border p-3 text-sm'>
            <p className='font-medium'>
              Última purga:{' '}
              {new Date(ultimaPurga.ejecutado_at).toLocaleString('es-PE')}
            </p>
            <p className='text-muted-foreground'>
              {ultimaPurga.filas_recargas} recargas ·{' '}
              {ultimaPurga.filas_retiros} retiros eliminados
            </p>
            <p className='text-muted-foreground'>
              Archivado aprobado: {formatUSD(ultimaPurga.recargas_aprobadas)} en
              recargas · {formatUSD(ultimaPurga.retiros_aprobados)} en retiros
            </p>
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Sin purgas registradas.
          </p>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='destructive' size='sm' disabled={purging}>
              <Trash2 className='size-4' />
              {purging ? 'Purgando...' : 'Purgar registros antiguos'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Ejecutar purga contable?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán definitivamente las recargas y retiros con más de{' '}
                {diasValidos} días de antigüedad. Los totales quedan archivados
                y el balance no cambia. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={purging}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void purgar(diasValidos)}
                disabled={purging}
              >
                Purgar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
