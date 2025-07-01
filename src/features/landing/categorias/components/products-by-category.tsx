import { Suspense } from "react"

import { IconDatabaseOff } from "@tabler/icons-react"
import { useProductosByCategoria } from "../../queries"
import ProductoCard from "./producto-card"

function ProductsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 md:gap-6 gap-2 pt-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="relative overflow-hidden pb-4 pt-0 md:pb-6 w-full max-w-sm gap-4 md:gap-6 bg-card rounded-lg">
          <div className="px-0">
            <div className="aspect-square bg-muted animate-pulse rounded-t-lg" />
            <div className="absolute right-2 top-2 flex flex-col gap-1">
              <div className="size-9 bg-muted/80 rounded-md animate-pulse" />
              <div className="size-9 bg-muted/80 rounded-md animate-pulse" />
              <div className="size-9 bg-muted/80 rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col px-4 space-y-3 mt-3">
            <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
            <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
              <div className="h-6 bg-muted rounded animate-pulse w-1/4" />
            </div>
            <div className="h-9 bg-muted rounded animate-pulse w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ProductsContent({ categoriaId }: { categoriaId: string }) {
  const { data: productos, isLoading } = useProductosByCategoria(categoriaId)

  if (isLoading) {
    return <ProductsLoading />
  }

  if (productos?.length === 0) {
    return <div className="flex flex-col items-center justify-center mt-36 h-full">
      <IconDatabaseOff className="text-muted-foreground " size={40} />
      <h3 className="text-lg font-semibold ">No hay productos</h3>
      <p className="text-muted-foreground">
        No hay productos en stock para esta categoría.
      </p>
    </div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:gap-4 gap-2 pt-4">
      {productos?.map((producto) => (
        <ProductoCard key={producto.id} producto={producto} />
      ))}
    </div>
  )
}

export function ProductsByCategory({ categoriaId }: { categoriaId: string }) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent categoriaId={categoriaId} />
    </Suspense>
  )
}