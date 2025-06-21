import { useProductosByCategoria } from "../../queries"
import ProductoCard from "../producto-card"

export function ProductsByCategory({ categoriaId }: { categoriaId: string }) {
  const { data: productos } = useProductosByCategoria(categoriaId)

  if (!productos || productos.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
        <p className="text-muted-foreground">
          No se encontraron productos en esta categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2 pt-4">
      {productos.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}