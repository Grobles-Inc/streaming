import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconFilter, IconX, IconCalendar, IconCurrencyDollar } from '@tabler/icons-react'
import type { Billetera, BilleteraFilters } from '../data/types'

interface BilleteraFiltersProps {
  billeteras: Billetera[]
  onFilter: (filteredBilleteras: Billetera[]) => void
  className?: string
}

export function BilleteraFiltersComponent({ billeteras, onFilter, className }: BilleteraFiltersProps) {
  const [filters, setFilters] = useState<BilleteraFilters>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof BilleteraFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Aplicar filtros automáticamente después de un breve delay
    setTimeout(() => {
      applyFiltersWithData(newFilters)
    }, 300)
  }

  const applyFiltersWithData = (currentFilters: BilleteraFilters) => {
    let filtered = [...billeteras]

    // Filtro por usuario
    if (currentFilters.usuario) {
      filtered = filtered.filter(billetera =>
        billetera.usuario?.nombres.toLowerCase().includes(currentFilters.usuario!.toLowerCase()) ||
        billetera.usuario?.apellidos.toLowerCase().includes(currentFilters.usuario!.toLowerCase()) ||
        billetera.usuario?.email.toLowerCase().includes(currentFilters.usuario!.toLowerCase())
      )
    }

    // Filtro por monto mínimo
    if (currentFilters.montoMin !== undefined && currentFilters.montoMin !== null) {
      filtered = filtered.filter(billetera => billetera.saldo >= currentFilters.montoMin!)
    }

    // Filtro por monto máximo
    if (currentFilters.montoMax !== undefined && currentFilters.montoMax !== null) {
      filtered = filtered.filter(billetera => billetera.saldo <= currentFilters.montoMax!)
    }

    // Filtro por fecha desde
    if (currentFilters.fechaDesde) {
      filtered = filtered.filter(billetera => {
        const fechaBilletera = new Date(billetera.created_at)
        const fechaFiltro = new Date(currentFilters.fechaDesde!)
        return fechaBilletera >= fechaFiltro
      })
    }

    // Filtro por fecha hasta
    if (currentFilters.fechaHasta) {
      filtered = filtered.filter(billetera => {
        const fechaBilletera = new Date(billetera.created_at)
        const fechaFiltro = new Date(currentFilters.fechaHasta!)
        return fechaBilletera <= fechaFiltro
      })
    }

    onFilter(filtered)
  }

  const applyFilters = () => {
    applyFiltersWithData(filters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter(billeteras)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros de Billeteras
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Activos
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {/* Primera fila - Búsqueda de usuario y rangos de monto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar usuario</label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nombre, apellido o email..."
                    value={filters.usuario || ''}
                    onChange={(e) => handleFilterChange('usuario', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Saldo mínimo</label>
                <div className="relative">
                  <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.montoMin || ''}
                    onChange={(e) => handleFilterChange('montoMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Saldo máximo</label>
                <div className="relative">
                  <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.montoMax || ''}
                    onChange={(e) => handleFilterChange('montoMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Segunda fila - Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Desde fecha</label>
                <div className="relative">
                  <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="date"
                    value={filters.fechaDesde || ''}
                    onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hasta fecha</label>
                <div className="relative">
                  <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="date"
                    value={filters.fechaHasta || ''}
                    onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2">
              <Button onClick={applyFilters} className="flex items-center gap-2">
                <IconFilter className="h-4 w-4" />
                Aplicar Filtros
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <IconX className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
