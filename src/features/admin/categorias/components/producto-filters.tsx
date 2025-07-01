import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconFilter, IconX, IconCalendar, IconCurrencyDollar } from '@tabler/icons-react'
import type { Producto } from '../data/types'

export interface ProductoFilters {
  nombre?: string
  proveedor?: string
  precioMin?: number
  precioMax?: number
  stockMin?: number
  stockMax?: number
  disponible?: boolean | null
  conImagen?: boolean | null
  fechaDesde?: string
  fechaHasta?: string
}

interface ProductoFiltersProps {
  productos: Producto[]
  onFilter: (filteredProductos: Producto[]) => void
  className?: string
}

export function ProductoFilters({ productos, onFilter, className }: ProductoFiltersProps) {
  const [filters, setFilters] = useState<ProductoFilters>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const applyFilters = () => {
    let filtered = [...productos]

    // Filtro por nombre
    if (filters.nombre) {
      filtered = filtered.filter(producto =>
        producto.nombre.toLowerCase().includes(filters.nombre!.toLowerCase()) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(filters.nombre!.toLowerCase()))
      )
    }

    // Filtro por proveedor
    if (filters.proveedor) {
      filtered = filtered.filter(producto =>
        (producto.usuarios && 
         (producto.usuarios.nombres.toLowerCase().includes(filters.proveedor!.toLowerCase()) ||
          producto.usuarios.apellidos.toLowerCase().includes(filters.proveedor!.toLowerCase()))) ||
        (producto.proveedor_id && producto.proveedor_id.toLowerCase().includes(filters.proveedor!.toLowerCase()))
      )
    }

    // Filtro por precio mínimo
    if (filters.precioMin !== undefined && filters.precioMin !== null) {
      filtered = filtered.filter(producto => producto.precio_publico >= filters.precioMin!)
    }

    // Filtro por precio máximo
    if (filters.precioMax !== undefined && filters.precioMax !== null) {
      filtered = filtered.filter(producto => producto.precio_publico <= filters.precioMax!)
    }

    // Filtro por stock mínimo
    if (filters.stockMin !== undefined && filters.stockMin !== null) {
      filtered = filtered.filter(producto => producto.stock >= filters.stockMin!)
    }

    // Filtro por stock máximo
    if (filters.stockMax !== undefined && filters.stockMax !== null) {
      filtered = filtered.filter(producto => producto.stock <= filters.stockMax!)
    }

    // Filtro por disponibilidad (basado en stock)
    if (filters.disponible !== null && filters.disponible !== undefined) {
      filtered = filtered.filter(producto => {
        const estaDisponible = producto.stock > 0
        return filters.disponible ? estaDisponible : !estaDisponible
      })
    }

    // Filtro por imagen
    if (filters.conImagen !== null && filters.conImagen !== undefined) {
      filtered = filtered.filter(producto => {
        const tieneImagen = !!producto.imagen_url
        return filters.conImagen ? tieneImagen : !tieneImagen
      })
    }

    // Filtro por fecha desde
    if (filters.fechaDesde) {
      filtered = filtered.filter(producto => {
        const fechaProducto = new Date(producto.created_at)
        const fechaFiltro = new Date(filters.fechaDesde!)
        return fechaProducto >= fechaFiltro
      })
    }

    // Filtro por fecha hasta
    if (filters.fechaHasta) {
      filtered = filtered.filter(producto => {
        const fechaProducto = new Date(producto.created_at)
        const fechaFiltro = new Date(filters.fechaHasta!)
        return fechaProducto <= fechaFiltro
      })
    }

    onFilter(filtered)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter(productos)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  const handleFilterChange = (key: keyof ProductoFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Aplicar filtros automáticamente después de un breve delay
    setTimeout(() => {
      applyFiltersWithData(newFilters)
    }, 300)
  }

  const applyFiltersWithData = (currentFilters: ProductoFilters) => {
    let filtered = [...productos]

    // Filtro por nombre
    if (currentFilters.nombre) {
      filtered = filtered.filter(producto =>
        producto.nombre.toLowerCase().includes(currentFilters.nombre!.toLowerCase()) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(currentFilters.nombre!.toLowerCase()))
      )
    }

    // Filtro por proveedor
    if (currentFilters.proveedor) {
      filtered = filtered.filter(producto =>
        (producto.usuarios && 
         (producto.usuarios.nombres.toLowerCase().includes(currentFilters.proveedor!.toLowerCase()) ||
          producto.usuarios.apellidos.toLowerCase().includes(currentFilters.proveedor!.toLowerCase()))) ||
        (producto.proveedor_id && producto.proveedor_id.toLowerCase().includes(currentFilters.proveedor!.toLowerCase()))
      )
    }

    // Filtro por precio mínimo
    if (currentFilters.precioMin !== undefined && currentFilters.precioMin !== null) {
      filtered = filtered.filter(producto => producto.precio_publico >= currentFilters.precioMin!)
    }

    // Filtro por precio máximo
    if (currentFilters.precioMax !== undefined && currentFilters.precioMax !== null) {
      filtered = filtered.filter(producto => producto.precio_publico <= currentFilters.precioMax!)
    }

    // Filtro por stock mínimo
    if (currentFilters.stockMin !== undefined && currentFilters.stockMin !== null) {
      filtered = filtered.filter(producto => producto.stock >= currentFilters.stockMin!)
    }

    // Filtro por stock máximo
    if (currentFilters.stockMax !== undefined && currentFilters.stockMax !== null) {
      filtered = filtered.filter(producto => producto.stock <= currentFilters.stockMax!)
    }

    // Filtro por disponibilidad (basado en stock)
    if (currentFilters.disponible !== null && currentFilters.disponible !== undefined) {
      filtered = filtered.filter(producto => {
        const estaDisponible = producto.stock > 0
        return currentFilters.disponible ? estaDisponible : !estaDisponible
      })
    }

    // Filtro por imagen
    if (currentFilters.conImagen !== null && currentFilters.conImagen !== undefined) {
      filtered = filtered.filter(producto => {
        const tieneImagen = !!producto.imagen_url
        return currentFilters.conImagen ? tieneImagen : !tieneImagen
      })
    }

    // Filtro por fecha desde
    if (currentFilters.fechaDesde) {
      filtered = filtered.filter(producto => {
        const fechaProducto = new Date(producto.created_at)
        const fechaFiltro = new Date(currentFilters.fechaDesde!)
        return fechaProducto >= fechaFiltro
      })
    }

    // Filtro por fecha hasta
    if (currentFilters.fechaHasta) {
      filtered = filtered.filter(producto => {
        const fechaProducto = new Date(producto.created_at)
        const fechaFiltro = new Date(currentFilters.fechaHasta!)
        return fechaProducto <= fechaFiltro
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
            Filtros de Productos
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
            {/* Primera fila - Búsquedas de texto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Proveedor</label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Nombre del proveedor..."
                    value={filters.proveedor || ''}
                    onChange={(e) => handleFilterChange('proveedor', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Segunda fila - Rangos de precio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Precio mínimo</label>
                <div className="relative">
                  <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.precioMin || ''}
                    onChange={(e) => handleFilterChange('precioMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Precio máximo</label>
                <div className="relative">
                  <IconCurrencyDollar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.precioMax || ''}
                    onChange={(e) => handleFilterChange('precioMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Tercera fila - Rangos de stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock mínimo</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.stockMin || ''}
                  onChange={(e) => handleFilterChange('stockMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stock máximo</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.stockMax || ''}
                  onChange={(e) => handleFilterChange('stockMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                />
              </div>
            </div>

            {/* Cuarta fila - Selectores y fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Disponibilidad (Stock)</label>
                <Select
                  value={filters.disponible === null ? 'todos' : filters.disponible ? 'si' : 'no'}
                  onValueChange={(value) => 
                    handleFilterChange('disponible', 
                      value === 'todos' ? null : value === 'si'
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="si">Con stock</SelectItem>
                    <SelectItem value="no">Sin stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="si">Con imagen</SelectItem>
                    <SelectItem value="no">Sin imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
