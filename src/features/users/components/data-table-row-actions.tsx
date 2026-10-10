import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconEye, IconUserCog, IconUserX, IconUserCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsersContext } from '../context/users-context'
import { MappedUser } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<MappedUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUsersContext()
  const user = row.original
  const isDisabled = !user.estado_habilitado
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('view')
            }}
          >
            <IconEye size={16} />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
            disabled={isDisabled}
          >
            <IconEdit size={16} />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('changeRole')
            }}
            disabled={isDisabled}
          >
            <IconUserCog size={16} />
            Cambiar Rol
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isDisabled ? (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('enable')
              }}
              className='text-green-600!'
            >
              <IconUserCheck size={16} />
              Habilitar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(row.original)
                setOpen('delete')
              }}
              variant='destructive'
            >
              <IconUserX size={16} />
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
