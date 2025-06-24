import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from '@tanstack/react-router'
import { useCategorias } from '../queries'
import { ProductsByCategory } from './components/products-by-category'


export default function Categoria({ nombre }: { nombre: string }) {
  const { data: categorias } = useCategorias()
  const categoria = categorias?.data.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())
  const categoriaId = categoria?.id || ''
  return (
    <div className="p-4">

      <ScrollArea className=" rounded-md bg-white border whitespace-nowrap hidden md:block">
        <div className="flex h-24 gap-8 px-7 items-center rounded-lg ">
          {categorias?.data.map((categoria) => (
            <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}
            >
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

      <ProductsByCategory categoriaId={categoriaId} key={categoriaId} />

    </div>
  )
}

