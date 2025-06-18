import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCompras } from '../context/compras-context'
import { useReciclarCompra } from '../queries'
import { ComprasImportDialog } from './compras-import-dialog'
import { ComprasMutateDrawer } from './compras-mutate-drawer'

export function ComprasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCompras()
  const { mutate: reciclarCompra, isPending } = useReciclarCompra()
  return (
    <>
      <ComprasImportDialog
        key='compras-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <ComprasMutateDrawer
            key={`compras-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
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
              reciclarCompra(currentRow.id)
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            className='max-w-md'
            title={`Reciclar esta compra: ${currentRow.id} ?`}
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
