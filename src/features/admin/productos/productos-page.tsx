import { Card, CardContent } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { ProductosTable } from './components/productos-table'

export function ProductosPage() {
  return (
      <Main>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de productos</h1>
              <p className="text-muted-foreground">
                Administra la configuración de productos existentes, precios y disponibilidad.
              </p>
            </div>
          </div>

          {/* Tabla de productos */}
          <Card>
            <CardContent>
              <ProductosTable />
            </CardContent>
          </Card>
        </div>
      </Main>
  )
}
