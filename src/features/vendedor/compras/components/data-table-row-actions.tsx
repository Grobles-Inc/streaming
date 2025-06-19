import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IconHeadphones, IconNote, IconRepeat, IconTrash } from '@tabler/icons-react'
import { Row } from '@tanstack/react-table'
import { useCompras } from '../context/compras-context'
import { productoOpciones } from '../data/data'
import { compraSchema } from '../data/schema'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const compra = compraSchema.parse(row.original)

  const { setOpen, setCurrentRow } = useCompras()

  return (
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
            setCurrentRow(compra)
            setOpen('update')
          }}
        >
          Renovar
          <DropdownMenuShortcut>
            <IconRepeat size={16} />
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
            setOpen('renovar')
          }}
        >
          Soporte
          <DropdownMenuShortcut>
            <IconHeadphones size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>



        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Producto</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={compra.producto_id}>
              {productoOpciones.map((opcion) => (
                <DropdownMenuRadioItem key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant='destructive'
          onClick={() => {
            setCurrentRow(compra)
            setOpen('delete')
          }}
        >
          Cancelar
          <DropdownMenuShortcut>
            <IconTrash color='red' size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
