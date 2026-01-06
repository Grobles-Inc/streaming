import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconPackage, IconClock, IconShoppingCart } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategorias } from '../queries'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { data: categorias } = useCategorias()

  // Convertir categorías de la BD al formato esperado por el filtro
  const categoriasOptions = Array.isArray(categorias)
    ? categorias.map((categoria) => ({
        label: categoria.nombre,
        value: categoria.id,
        icon: IconPackage, // Usar un icono genérico por ahora
      }))
    : []

  // Opciones para disponibilidad
  const disponibilidadOptions = [
    {
      label: 'En Stock',
      value: 'en_stock',
      icon: IconPackage,
    },
    {
      label: 'A Pedido',
      value: 'a_pedido',
      icon: IconClock,
    },
    {
      label: 'Activación',
      value: 'activacion',
      icon: IconShoppingCart,
    },
  ]

  return (
    <div className='space-y-4'>
      {/* Fila superior: Búsqueda y opciones de vista */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='grid w-fit grid-cols-2 gap-2 md:flex'>
          <Input
            placeholder='Buscar productos...'
            value={
              (table.getColumn('nombre')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('nombre')?.setFilterValue(event.target.value)
            }
            className='h-8 min-w-[150px] lg:w-[250px]'
          />
          {table.getColumn('categorias') && (
            <DataTableFacetedFilter
              column={table.getColumn('categorias')}
              title='Categorías'
              options={categoriasOptions}
            />
          )}
          {table.getColumn('disponibilidad') && (
            <DataTableFacetedFilter
              column={table.getColumn('disponibilidad')}
              title='Disponibilidad'
              options={disponibilidadOptions}
            />
          )}
          {table.getColumn('renovable') && (
            <DataTableFacetedFilter
              column={table.getColumn('renovable')}
              title='Renovable'
              options={[
                { label: 'Renovable', value: true },
                { label: 'No Renovable', value: false },
              ]}
            />
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {/* Fila inferior: Filtros */}
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <div className='flex flex-wrap items-center gap-2'></div>

        <div className='flex items-center space-x-2'>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3'
            >
              Limpiar
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
