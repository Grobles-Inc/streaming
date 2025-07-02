import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { IconSearch } from '@tabler/icons-react'
import type { Categoria } from '../data/types'

interface CategoriaFiltersProps {
  categorias: Categoria[]
  onFilter: (filteredCategorias: Categoria[]) => void
  className?: string
}

export function CategoriaFilters({ categorias, onFilter, className }: CategoriaFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    
    if (!value.trim()) {
      onFilter(categorias)
      return
    }

    const filtered = categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(value.toLowerCase()) ||
      (categoria.descripcion && categoria.descripcion.toLowerCase().includes(value.toLowerCase()))
    )

    onFilter(filtered)
  }

  return (
    <div className={className}>
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar categorías por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  )
}