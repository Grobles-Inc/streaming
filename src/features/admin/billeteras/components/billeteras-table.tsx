import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight
} from '@tabler/icons-react'
import { useState } from 'react'
import type { Billetera } from '../data/types'

interface BilleterasTableProps {
  billeteras: Billetera[]
  onViewMovimientos: (billetera: Billetera) => void
  className?: string
}

export function BilleterasTable({ billeteras, onViewMovimientos }: BilleterasTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(200)

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBilleteras = billeteras.slice(startIndex, endIndex)
  const totalPages = Math.ceil(billeteras.length / itemsPerPage)

  // Resetear a la primera página cuando cambia el tamaño de página
  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize)
    setCurrentPage(0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }



  const getRolBadge = (rol: string) => {
    const variants = {
      admin: 'default',
      provider: 'secondary',
      seller: 'outline'
    } as const

    const labels = {
      admin: 'Administrador',
      provider: 'Proveedor',
      seller: 'Vendedor'
    }

    return (
      <Badge variant={variants[rol as keyof typeof variants] || 'outline'}>
        {labels[rol as keyof typeof labels] || rol}
      </Badge>
    )
  }



  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Saldo</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBilleteras.map(billetera => (
              <tr key={billetera.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {billetera.usuario?.nombres} {billetera.usuario?.apellidos}
                    </span>
                    {billetera.usuario?.telefono && (
                      <span className="text-xs text-gray-500">
                        {billetera.usuario.telefono}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {billetera.usuario?.email}
                </td>
                <td className="px-4 py-3">
                  {billetera.usuario?.rol && getRolBadge(billetera.usuario.rol)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold ">
                    {formatCurrency(billetera.saldo)}
                  </span>
                </td>


                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <DotsVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => onViewMovimientos(billetera)}
                      >
                        Ver movimientos
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Ver detalles
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {billeteras.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron billeteras
          </div>
        )}
      </div>

      {/* Paginación mejorada */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, billeteras.length)} de {billeteras.length} billeteras
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <select
                value={itemsPerPage}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 w-[80px] rounded border border-input bg-background px-3 py-1 text-sm"
              >
                {[10, 20, 50, 100, 200].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {currentPage + 1} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(0)}
                disabled={currentPage === 0}
              >
                <span className="sr-only">Ir a la primera página</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <span className="sr-only">Ir a la última página</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
