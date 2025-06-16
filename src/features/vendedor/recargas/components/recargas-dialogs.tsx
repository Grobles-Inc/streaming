import { useRecargas } from '../context/recargas-context'
import { RecargasImportDialog } from './recargas-import-dialog'
import { RecargasMutateDrawer } from './recargas-mutate-drawer'

export function RecargasDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRecargas()
  return (
    <>
      <RecargasMutateDrawer
        key='recarga-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <RecargasImportDialog
        key='recargas-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <RecargasMutateDrawer
          key={`recarga-update-${currentRow.id}`}
          open={open === 'update'}
          onOpenChange={() => {
            setOpen('update')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
