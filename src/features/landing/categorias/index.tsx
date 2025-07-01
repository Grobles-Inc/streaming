import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from '@tanstack/react-router'
import { useCategorias } from '../queries'
import { ProductsByCategory } from './components/products-by-category'
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"


export default function Categoria({ nombre }: { nombre: string }) {
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null)
  const isMobile = useIsMobile()
  // Validaciones adicionales
  const categoriasData = categorias?.data || []
  const categoria = categoriasData.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())
  const categoriaId = categoria?.id || ''

  return (
    <div className="p-4">
      {/* Scroll horizontal de categorías - Solo mostrar si hay datos */}
      {!loadingCategorias && categoriasData.length > 0 && (
        <ScrollArea className=" rounded-md bg-white border whitespace-nowrap hidden md:block">
          <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
            {categoriasData.map((categoria) => (
              <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img src={categoria.imagen_url || ''} alt={categoria.nombre} className="size-16" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoria.nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <div className="flex justify-center gap-8 mt-4 mx-auto max-w-6xl">
        {!loadingCategorias && categoriasData.length > 0 && !isMobile && (
          <div className="w-72 border rounded-md overflow-hidden">
            <ul className="divide-y">
              {categoriasData.map((categoria) => (
                <li key={categoria.id}>
                  <Link
                    to="/categoria/$name"
                    params={{ name: categoria.nombre.toLowerCase() }}
                    onClick={() => setFocusedCategory(categoria.id)}
                  >
                    <Button size="lg" variant={focusedCategory === categoria.id ? "secondary" : "ghost"} className="flex items-center justify-between w-full rounded-none">
                      <span className=" text-base font-semibold">{categoria.nombre}</span>
                    </Button>
                  </Link>
                </li>
              ))}
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

