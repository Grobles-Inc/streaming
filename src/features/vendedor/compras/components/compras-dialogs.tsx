import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCompras } from '../context/compras-context'
import { useReciclarCompra } from '../queries'
import ComprasProductoDialog from './compras-producto-dialog'
import { ComprasSoporteModal } from './compras-soporte-modal'

export function ComprasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCompras()
  const { mutate: reciclarCompra, isPending } = useReciclarCompra()
  return (
    <>

      {currentRow && (
        <>
          <ComprasSoporteModal
            key={`compras-soporte-${currentRow.id}`}
            currentRow={currentRow}
            open={open === 'soporte'}
            onOpenChange={() => {
              setOpen('soporte')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
          />

          <ComprasProductoDialog
            key={`compras-producto-${currentRow.id}`}
            open={open === 'ver_producto'}
            onOpenChange={() => {
              setOpen('ver_producto')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            id={currentRow.producto_id}
          />

          <ConfirmDialog
            key='compra-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              if (!currentRow.id) return
              reciclarCompra(currentRow.id)
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            className='max-w-md'
            title={`Reciclar esta compra: ${currentRow.productos?.nombre} ?`}
            desc={
              <>
                Estás a punto de reciclar la compra con el ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                Esta acción no se puede deshacer.
              </>
            }
            confirmText={isPending ? 'Reciclando...' : 'Reciclar'}
            isLoading={isPending}
          />
        </>
      )}
    </>
  )
}
