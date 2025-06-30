import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { HistorialConfiguracion } from '../data/types'

interface HistorialConfiguracionProps {
  historial: HistorialConfiguracion[]
  onRestore: (id: string) => void
  loading?: boolean
}

export function HistorialConfiguracionCard({ 
  historial, 
  onRestore, 
  loading = false 
}: HistorialConfiguracionProps) {
  const formatFecha = (fecha: Date) => {
    return format(fecha, "dd/MM/yyyy 'a las' HH:mm", { locale: es })
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Historial de Configuraciones</CardTitle>
      </CardHeader>
      <CardContent>
        {historial.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay historial de configuraciones disponible
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead>Email Soporte</TableHead>
                  <TableHead>Comisión Global</TableHead>
                  <TableHead>Conversión</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.map((config, index) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatFecha(config.fechaCambio)}
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={config.mantenimiento ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {config.mantenimiento ? 'Activado' : 'Desactivado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {config.email_soporte}
                    </TableCell>
                    <TableCell>
                      {config.comision}%
                    </TableCell>
                    <TableCell>
                      {config.conversion}
                    </TableCell>
                    <TableCell className="text-right">
                      {index > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRestore(config.id)}
                          disabled={loading}
                        >
                          Restaurar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
