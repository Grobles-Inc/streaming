import { CustomEmpty } from '@/components/custom-empty'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package } from 'lucide-react'
import type { Producto } from '../data/types'

interface ProductosTableProps {
  productos: Producto[]
  loading: boolean
  onUpdateProducto: (id: string, updates: Partial<Producto>) => Promise<Producto>
}

export function ProductosTable({ productos, loading }: ProductosTableProps) {

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
  
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='Cargando productos...'
                        description='Estamos obteniendo el listado de productos.'
                        icon={<Loader2 className='size-10 animate-spin' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={9} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='No hay productos disponibles'
                        description='No se encontraron productos con los filtros actuales.'
                        icon={<Package className='size-10' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
              productos.map((producto) => {
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
                        {producto.nuevo && (
                          <Badge variant="outline" className="text-xs">Nuevo</Badge>
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
              }))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
