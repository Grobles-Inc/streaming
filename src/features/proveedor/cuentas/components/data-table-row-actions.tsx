import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Cuenta } from '../data/schema'
import { useDeleteCuenta } from '../queries'
import { CuentaForm } from './cuenta-form'

interface DataTableRowActionsProps {
  row: Row<Cuenta>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const cuenta = row.original
  const deleteCuentaMutation = useDeleteCuenta()
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <IconEdit className='mr-2 h-4 w-4' />
            Editar cuenta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className='text-red-600' 
            onClick={() => deleteCuentaMutation.mutate(cuenta.id)}
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditDialog && (
        <CuentaForm
          cuentaToEdit={cuenta}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => setShowEditDialog(false)}
        />
      )}
    </>
  )
} 