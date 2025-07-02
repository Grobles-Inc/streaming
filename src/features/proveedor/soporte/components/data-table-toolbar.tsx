import { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const estadoOptions = [
  {
    label: 'Cuenta Sin Problemas',
    value: 'activo',
    icon: '🟢',
  },
  {
    label: 'Problemas con Cuenta',
    value: 'soporte',
    icon: '🔴',
  },
  {
    label: 'Error Resuelto',
    value: 'resuelto',
    icon: '🔵',
  },
]

const asuntoOptions = [
  {
    label: 'Correo',
    value: 'correo',
  },
  {
    label: 'Clave',
    value: 'clave',
  },
  {
    label: 'Pago',
    value: 'pago',
  },
  {
    label: 'Reembolso',
    value: 'reembolso',
  },
  {
    label: 'Geolocalización',
    value: 'geo',
  },
  {
    label: 'Código',
    value: 'codigo',
  },
  {
    label: 'Otros',
    value: 'otros',
  },
]

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Buscar por cliente..."
          value={(table.getColumn('nombre_cliente')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nombre_cliente')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('stock_productos.soporte_stock_producto') && (
          <DataTableFacetedFilter
            column={table.getColumn('stock_productos.soporte_stock_producto')}
            title="Estado"
            options={estadoOptions}
          />
        )}
        {table.getColumn('soporte_asunto') && (
          <DataTableFacetedFilter
            column={table.getColumn('soporte_asunto')}
            title="Asunto"
            options={asuntoOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
} 