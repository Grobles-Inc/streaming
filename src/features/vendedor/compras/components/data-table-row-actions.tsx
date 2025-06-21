import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IconEye, IconHeadphones, IconLoader2, IconNote, IconRepeat, IconTrash } from '@tabler/icons-react'
import { Row } from '@tanstack/react-table'
import { useCompras } from '../context/compras-context'
import { compraSchema } from '../data/schema'
import { useRenovarCompra } from '../queries'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const compra = compraSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useCompras()
  const { mutate: renovarCompra, isPending } = useRenovarCompra()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            if (compra.id) {
              renovarCompra(compra.id)
            }
          }}
          disabled={isPending}
        >
          Renovar
          <DropdownMenuShortcut>
            {isPending ? <IconLoader2 className='animate-spin' size={16} /> : <IconRepeat size={16} />}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(compra)
            setOpen('update')
          }}
        >
          Notas
          <DropdownMenuShortcut>
            <IconNote size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(compra)
            setOpen('soporte')
          }}
        >
          Soporte
          <DropdownMenuShortcut>
            <IconHeadphones size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>



        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(compra)
            setOpen('ver_producto')
          }}
        >
          Ver Producto
          <DropdownMenuShortcut>
            <IconEye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onClick={() => {
            setCurrentRow(compra)
            setOpen('delete')
          }}
        >
          Reciclar
          <DropdownMenuShortcut>
            <IconTrash color='red' size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
