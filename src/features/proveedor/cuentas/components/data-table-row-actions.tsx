import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconEye, IconTrash, IconShoppingCart, IconEyeOff, IconCheck } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Cuenta } from '../data/schema'

interface DataTableRowActionsProps {
  row: Row<Cuenta>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const cuenta = row.original

  return (
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
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem>
          <IconEye className='mr-2 h-4 w-4' />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconEdit className='mr-2 h-4 w-4' />
          Editar cuenta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {cuenta.estado === 'disponible' && (
          <DropdownMenuItem>
            <IconShoppingCart className='mr-2 h-4 w-4' />
            Vender
          </DropdownMenuItem>
        )}
        {cuenta.publicado ? (
          <DropdownMenuItem>
            <IconEyeOff className='mr-2 h-4 w-4' />
            Despublicar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <IconCheck className='mr-2 h-4 w-4' />
            Publicar
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className='text-red-600'>
          <IconTrash className='mr-2 h-4 w-4' />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 