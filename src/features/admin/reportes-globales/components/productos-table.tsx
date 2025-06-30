import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Producto } from '../data/types'

interface ProductosTableProps {
  productos: Producto[]
  loading: boolean
  onUpdateProducto: (id: string, updates: Partial<Producto>) => Promise<Producto>
}

export function ProductosTable({ productos, loading, onUpdateProducto }: ProductosTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
          <CardDescription>Listado de productos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDisponibilidadBadge = (disponibilidad: string) => {
    switch (disponibilidad) {
      case 'en_stock': return { variant: 'default' as const, label: 'En Stock' }
      case 'a_pedido': return { variant: 'secondary' as const, label: 'A Pedido' }
      case 'activacion': return { variant: 'outline' as const, label: 'Activación' }
      default: return { variant: 'outline' as const, label: disponibilidad }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos</CardTitle>
        <CardDescription>Listado de productos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Proveedor</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Precio Público</th>
                <th className="px-4 py-2 text-left">Precio Vendedor</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Disponibilidad</th>
                <th className="px-4 py-2 text-left">Destacado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const disponibilidad = getDisponibilidadBadge(producto.disponibilidad)
                return (
                  <tr key={producto.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border-r font-medium">{producto.nombre}</td>
                    <td className="px-4 py-2 border-r">
                      {producto.usuarios ? (
                        `${producto.usuarios.nombres} ${producto.usuarios.apellidos}`
                      ) : (
                        <span className="text-gray-500 font-mono text-xs">ID: {producto.proveedor_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r">
                      {producto.categorias?.nombre || (
                        <span className="text-gray-500 font-mono text-xs">ID: {producto.categoria_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r">${(producto.precio_publico || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 border-r">${(producto.precio_vendedor || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 border-r">
                      <Badge variant={producto.stock > 0 ? 'default' : 'destructive'}>
                        {producto.stock || 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 border-r">
                      <Badge variant={disponibilidad.variant}>
                        {disponibilidad.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 border-r">
                      <div className="flex gap-1">
                        {producto.destacado && (
                          <Badge variant="secondary" className="text-xs">Destacado</Badge>
                        )}
                        {producto.nuevo && (
                          <Badge variant="outline" className="text-xs">Nuevo</Badge>
                        )}
                        {producto.mas_vendido && (
                          <Badge variant="default" className="text-xs">+ Vendido</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Implementar modal de edición
                          console.log('Editar producto:', producto.id)
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
