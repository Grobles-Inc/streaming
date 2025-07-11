import { useUsersContext } from '../context/users-context'
import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersEnableDialog } from './users-enable-dialog'
import { UsersDetailsDialog } from './users-details-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { UsersChangeRoleDialog } from './users-change-role-dialog'
import { DisabledUsersModal } from './disabled-users-modal'
import { UsersPermanentDeleteDialog } from './users-permanent-delete-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsersContext()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersDetailsDialog
            key={`user-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={() => {
              setOpen('view')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersChangeRoleDialog
            key={`user-change-role-${currentRow.id}`}
            open={open === 'changeRole'}
            onOpenChange={() => {
              setOpen('changeRole')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <UsersEnableDialog
            key={`user-enable-${currentRow.id}`}
            open={open === 'enable'}
            onOpenChange={() => {
              setOpen('enable')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}

      {/* Modales que no requieren currentRow */}
      <DisabledUsersModal />
      <UsersPermanentDeleteDialog />
    </>
  )
}
