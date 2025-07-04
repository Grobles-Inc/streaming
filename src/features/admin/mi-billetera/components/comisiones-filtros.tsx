import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconFilter, IconX, IconCalendar, IconSearch, IconRefresh } from '@tabler/icons-react'
import type { FiltrosComisiones } from '../data/types'

interface ComisionesFiltrosProps {
  filtros: FiltrosComisiones
  onFiltrosChange: (filtros: FiltrosComisiones) => void
  onLimpiarFiltros: () => void
  loading?: boolean
}

export function ComisionesFiltros({ 
  filtros, 
  onFiltrosChange, 
  onLimpiarFiltros,
  loading 
}: ComisionesFiltrosProps) {
  const [filtrosLocal, setFiltrosLocal] = useState<FiltrosComisiones>(filtros)

  const handleApplyFiltros = () => {
    onFiltrosChange(filtrosLocal)
  }

  const handleLimpiarFiltros = () => {
    setFiltrosLocal({})
    onLimpiarFiltros()
  }

  const today = new Date().toISOString().split('T')[0]
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const filtrosActivos = Object.keys(filtros).filter(key => 
    filtros[key as keyof FiltrosComisiones] && 
    filtros[key as keyof FiltrosComisiones] !== 'todos'
  ).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtros de Búsqueda
            {filtrosActivos > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filtrosActivos} activo{filtrosActivos > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLimpiarFiltros}
            disabled={loading || filtrosActivos === 0}
          >
            <IconX className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Comisión</Label>
            <Select
              value={filtrosLocal.tipo || 'todos'}
              onValueChange={(value) =>
                setFiltrosLocal(prev => ({ 
                  ...prev, 
                  tipo: value === 'todos' ? undefined : value as 'publicacion' | 'retiro'
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="publicacion">Publicación</SelectItem>
                <SelectItem value="retiro">Retiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por fecha inicio */}
          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Inicio</Label>
            <div className="relative">
              <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="fechaInicio"
                type="date"
                value={filtrosLocal.fechaInicio || ''}
                onChange={(e) =>
                  setFiltrosLocal(prev => ({ 
                    ...prev, 
                    fechaInicio: e.target.value || undefined 
                  }))
                }
                max={today}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por fecha fin */}
          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Fin</Label>
            <div className="relative">
              <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="fechaFin"
                type="date"
                value={filtrosLocal.fechaFin || ''}
                onChange={(e) =>
                  setFiltrosLocal(prev => ({ 
                    ...prev, 
                    fechaFin: e.target.value || undefined 
                  }))
                }
                max={today}
                min={filtrosLocal.fechaInicio}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtro por usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="usuario"
                placeholder="Buscar usuario..."
                value={filtrosLocal.usuario || ''}
                onChange={(e) =>
                  setFiltrosLocal(prev => ({ 
                    ...prev, 
                    usuario: e.target.value || undefined 
                  }))
                }
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Filtro por producto (solo para publicaciones) */}
        {(!filtrosLocal.tipo || filtrosLocal.tipo === 'publicacion') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="producto">Producto</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="producto"
                  placeholder="Buscar producto..."
                  value={filtrosLocal.producto || ''}
                  onChange={(e) =>
                    setFiltrosLocal(prev => ({ 
                      ...prev, 
                      producto: e.target.value || undefined 
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground self-center">Filtros rápidos:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltrosLocal({
                fechaInicio: lastMonth,
                fechaFin: today
              })
            }}
          >
            Últimos 30 días
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                .toISOString().split('T')[0]
              setFiltrosLocal({
                fechaInicio: firstDayOfMonth,
                fechaFin: today
              })
            }}
          >
            Este mes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltrosLocal({ tipo: 'publicacion' })
            }}
          >
            Solo publicaciones
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltrosLocal({ tipo: 'retiro' })
            }}
          >
            Solo retiros
          </Button>
        </div>

        {/* Botón aplicar filtros */}
        <div className="flex justify-end pt-2 border-t">
          <Button 
            onClick={handleApplyFiltros}
            disabled={loading}
            className="min-w-32"
          >
            {loading ? (
              <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <IconFilter className="h-4 w-4 mr-2" />
            )}
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
