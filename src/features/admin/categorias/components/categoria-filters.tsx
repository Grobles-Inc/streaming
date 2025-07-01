import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconFilter, IconX, IconCalendar } from '@tabler/icons-react'
import type { Categoria } from '../data/types'

export interface CategoriaFilters {
  nombre?: string
  fechaDesde?: string
  fechaHasta?: string
  conImagen?: boolean | null
}

interface CategoriaFiltersProps {
  categorias: Categoria[]
  onFilter: (filteredCategorias: Categoria[]) => void
  className?: string
}

export function CategoriaFilters({ categorias, onFilter, className }: CategoriaFiltersProps) {
  const [filters, setFilters] = useState<CategoriaFilters>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const applyFilters = () => {
    let filtered = [...categorias]

    // Filtro por nombre
    if (filters.nombre) {
      filtered = filtered.filter(categoria =>
        categoria.nombre.toLowerCase().includes(filters.nombre!.toLowerCase()) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(filters.nombre!.toLowerCase()))
      )
    }

    // Filtro por imagen
    if (filters.conImagen !== null && filters.conImagen !== undefined) {
      filtered = filtered.filter(categoria => {
        const tieneImagen = !!categoria.imagen_url
        return filters.conImagen ? tieneImagen : !tieneImagen
      })
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      filtered = filtered.filter(categoria => {
        const fechaCategoria = new Date(categoria.created_at)
        const fechaFiltro = new Date(filters.fechaDesde!)
        return fechaCategoria >= fechaFiltro
      })
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      filtered = filtered.filter(categoria => {
        const fechaCategoria = new Date(categoria.created_at)
        const fechaFiltro = new Date(filters.fechaHasta!)
        return fechaCategoria <= fechaFiltro
      })
    }

    onFilter(filtered)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter(categorias)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  const handleFilterChange = (key: keyof CategoriaFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Aplicar filtros automáticamente después de un breve delay
    setTimeout(() => {
      applyFiltersWithData(newFilters)
    }, 300)
  }

  const applyFiltersWithData = (currentFilters: CategoriaFilters) => {
    let filtered = [...categorias]

    // Filtro por nombre
    if (currentFilters.nombre) {
      filtered = filtered.filter(categoria =>
        categoria.nombre.toLowerCase().includes(currentFilters.nombre!.toLowerCase()) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(currentFilters.nombre!.toLowerCase()))
      )
    }

    // Filtro por imagen
    if (currentFilters.conImagen !== null && currentFilters.conImagen !== undefined) {
      filtered = filtered.filter(categoria => {
        const tieneImagen = !!categoria.imagen_url
        return currentFilters.conImagen ? tieneImagen : !tieneImagen
      })
    }

    // Filtro por fecha desde
    if (currentFilters.fechaDesde) {
      filtered = filtered.filter(categoria => {
        const fechaCategoria = new Date(categoria.created_at)
        const fechaFiltro = new Date(currentFilters.fechaDesde!)
        return fechaCategoria >= fechaFiltro
      })
    }

    // Filtro por fecha hasta
    if (currentFilters.fechaHasta) {
      filtered = filtered.filter(categoria => {
        const fechaCategoria = new Date(categoria.created_at)
        const fechaFiltro = new Date(currentFilters.fechaHasta!)
        return fechaCategoria <= fechaFiltro
      })
    }

    onFilter(filtered)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros de Categorías
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
            {/* Búsqueda por nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nombre</label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nombre o descripción..."
                    value={filters.nombre || ''}
                    onChange={(e) => handleFilterChange('nombre', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por imagen */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Con imagen</label>
                <Select
                  value={filters.conImagen === null ? 'todos' : filters.conImagen ? 'si' : 'no'}
                  onValueChange={(value) => 
                    handleFilterChange('conImagen', 
                      value === 'todos' ? null : value === 'si'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="si">Con imagen</SelectItem>
                    <SelectItem value="no">Sin imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha desde */}
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

              {/* Fecha hasta */}
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
