import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react'
import type { Billetera } from '../data/types'

interface BilleteraFiltersProps {
  billeteras: Billetera[]
  onFilter: (filteredBilleteras: Billetera[]) => void
  className?: string
}

export function BilleteraFiltersComponent({ billeteras, onFilter, className }: BilleteraFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    
    // Aplicar filtro automáticamente
    if (value.trim() === '') {
      onFilter(billeteras)
      return
    }

    const filtered = billeteras.filter(billetera =>
      billetera.usuario?.nombres.toLowerCase().includes(value.toLowerCase()) ||
      billetera.usuario?.apellidos.toLowerCase().includes(value.toLowerCase()) ||
      billetera.usuario?.email.toLowerCase().includes(value.toLowerCase())
    )

    onFilter(filtered)
  }

  const clearSearch = () => {
    setSearchTerm('')
    onFilter(billeteras)
  }

  return (
    <div className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Buscar Usuario
            {searchTerm && (
              <Badge variant="secondary" className="ml-2">
                Filtrado
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button variant="outline" onClick={clearSearch} className="flex items-center gap-2">
              <IconX className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </CardContent>
    </div>
  )
}
