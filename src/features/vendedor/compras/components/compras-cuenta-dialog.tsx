import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { IconLoader2 } from '@tabler/icons-react'
import { useMarcarCuentaActualizadaRevisada } from '../queries'

/**
 * Subconjunto de una compra necesario para mostrar y limpiar la
 * notificación de cambio de cuenta. Acepta tanto la fila ligera de la
 * campana como la compra completa del listado.
 */
export interface CompraCuentaInfo {
  id?: number
  mensaje_notificacion?: string | null
  stock_productos?: {
    email?: string | null
    perfil?: string | null
    pin?: string | null
    clave?: string | null
    url?: string | null
  } | null
  productos?: { nombre?: string | null } | null
}

interface ComprasCuentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compra: CompraCuentaInfo | null
}

const AccountField = ({
  label,
  value,
  href,
}: {
  label: string
  value: string | null | undefined
  href?: string | null
}) => (
  <div className='flex flex-col gap-1'>
    <span className='text-muted-foreground text-xs'>{label}</span>
    {href ? (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='truncate text-sm break-all text-blue-600 hover:underline'
        title={href}
      >
        {value}
      </a>
    ) : (
      <span className='truncate font-mono text-sm' title={value ?? ''}>
        {value || 'Sin dato'}
      </span>
    )}
  </div>
)

export default function ComprasCuentaDialog({
  open,
  onOpenChange,
  compra,
}: ComprasCuentaDialogProps) {
  const { mutate: marcarRevisada, isPending } =
    useMarcarCuentaActualizadaRevisada()

  const cuenta = compra?.stock_productos

  const handleConfirm = () => {
    if (!compra?.id) {
      onOpenChange(false)
      return
    }
    marcarRevisada(compra.id, {
      onSettled: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Datos de cuenta actualizados</DialogTitle>
          <DialogDescription>
            {compra?.mensaje_notificacion ||
              (compra?.productos?.nombre
                ? `El proveedor actualizó la cuenta de ${compra.productos.nombre}.`
                : 'El proveedor actualizó los datos de esta cuenta.')}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <AccountField label='Email' value={cuenta?.email} />
          <AccountField label='Clave' value={cuenta?.clave} />
          <AccountField label='PIN' value={cuenta?.pin} />
          <AccountField label='Perfil' value={cuenta?.perfil} />
          <div className='sm:col-span-2'>
            <AccountField
              label='URL'
              value={cuenta?.url || 'Sin dato'}
              href={cuenta?.url}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <IconLoader2 className='animate-spin' size={16} />
            ) : (
              'Entendido'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
