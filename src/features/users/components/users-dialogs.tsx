import { useUsersContext } from '../context/users-context-new'
import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersDetailsDialog } from './users-details-dialog'
import { UsersInviteWithReferralDialog } from './users-invite-referral-dialog'
import { UsersRegisterWithReferralDialog } from './users-register-with-referral-dialog'
import { UsersChangeRoleDialog } from './users-change-role-dialog'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refreshUsers } = useUsersContext()
  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <UsersInviteWithReferralDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      <UsersRegisterWithReferralDialog
        key='user-register-referral'
        open={open === 'registerWithReferral'}
        onOpenChange={() => setOpen('registerWithReferral')}
        onSuccess={() => {
          refreshUsers()
        }}
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
        </>
      )}
    </>
  )
}
