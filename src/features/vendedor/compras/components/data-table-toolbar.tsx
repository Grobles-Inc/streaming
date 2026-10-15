import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { useAuth } from '@/stores/authStore'
import { estados } from '../data/data'
import type { CompraCuentaActualizada } from '../services'
import ComprasCuentaDialog from './compras-cuenta-dialog'
import { ComprasNotificacionesBell } from './compras-notificaciones-bell'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { user } = useAuth()
  const [cuentaCompra, setCuentaCompra] =
    useState<CompraCuentaActualizada | null>(null)

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Buscar compra...'
            value={table.getState().globalFilter ?? ''}
            onChange={e => table.setGlobalFilter(e.target.value)}
            className='h-8 w-full lg:w-[250px]'
          />
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              options={estados}
            />
          )}
        </div>

        <div className='flex items-center gap-2'>
          {user?.rol === 'seller' && (
            <ComprasNotificacionesBell
              vendedorId={user.id}
              onSelectCompra={setCuentaCompra}
            />
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <ComprasCuentaDialog
        compra={cuentaCompra}
        open={!!cuentaCompra}
        onOpenChange={(open) => {
          if (!open) setCuentaCompra(null)
        }}
      />
    </>
  )
}
