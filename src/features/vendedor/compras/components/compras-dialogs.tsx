import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCompras } from '../context/compras-context'
import { ComprasImportDialog } from './compras-import-dialog'
import { ComprasMutateDrawer } from './compras-mutate-drawer'

export function ComprasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCompras()
  return (
    <>
      <ComprasMutateDrawer
        key='compras-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

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
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'La siguiente compra ha sido cancelada:'
              )
            }}
            className='max-w-md'
            title={`Cancelar esta compra: ${currentRow.id} ?`}
            desc={
              <>
                Estás a punto de cancelar la compra con el ID{' '}
                <strong>{currentRow.id}</strong>. <br />
                Esta acción no se puede deshacer.
              </>
            }
            confirmText='Cancelar'
          />
        </>
      )}
    </>
  )
}
