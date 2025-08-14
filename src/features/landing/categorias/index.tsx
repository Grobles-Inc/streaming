import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from '@tanstack/react-router'
import { useCategorias } from '../queries'
import { useImageProxy } from '@/hooks/use-image-proxy'
import { ProductsByCategory } from './components/products-by-category'
import { useState, useMemo, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { useProductos } from "../queries/productos"

import type { Categoria } from "../services/index"


export default function Categoria({ nombre }: { nombre: string }) {
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const { getProxiedImageUrl } = useImageProxy()
  const { data: productos } = useProductos()
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)


  const isMobile = useIsMobile()
  // Validaciones adicionales
  const categoriasData = categorias || []
  const categoria = categoriasData.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())
  const categoriaId = categoria?.id || ''

  // Calculate products count per category
  const productosCountByCategory = useMemo(() => {
    if (!productos?.data) return {}

    return productos.data.reduce((acc, producto) => {
      const catId = producto.categoria_id
      if (catId) {
        acc[catId] = (acc[catId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
  }, [productos?.data])


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  return (
    <div className="p-4">
      {/* Scroll horizontal de categorías - Solo mostrar si hay datos */}
      {!loadingCategorias && categoriasData.length > 0 && (
        <ScrollArea className=" rounded-md bg-white border whitespace-nowrap hidden md:block">
          <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
            {categoriasData.map((categoria: Categoria) => {
              return (
                <Link className="w-20" key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img src={getProxiedImageUrl(categoria.imagen_url)} alt={categoria.nombre} className="size-16" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{categoria.nombre}</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <div className="flex justify-center gap-8 mt-4 mx-auto max-w-7xl">
        {!loadingCategorias && categoriasData.length > 0 && !isMobile && (
          <div className="w-96 border rounded-md overflow-hidden">
            <ul className="divide-y">
              {categoriasData.map((categoria) => {
                const totalProductos = productosCountByCategory[categoria.id] || 0
                return (
                  <li key={categoria.id}>
                    <Link
                      to="/categoria/$name"
                      params={{ name: categoria.nombre.toLowerCase() }}
                      onClick={() => setFocusedCategory(categoria.id)}
                    >
                      <Button size="lg" variant={focusedCategory === categoria.id ? "secondary" : "ghost"} className="flex justify-start items-center gap-2 w-full rounded-none">
                        <span>{categoria.nombre}</span>
                        <span className="text-sm text-zinc-500">({totalProductos})</span>
                      </Button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-col w-full ">
          <h2 className="text-2xl font-bold uppercase">{categoria?.nombre}</h2>
          <ProductsByCategory categoriaId={categoriaId} key={categoriaId} />
        </div>
      </div>
    </div>
  )
}

