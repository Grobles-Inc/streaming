import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import { Link } from '@tanstack/react-router'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCategorias } from '../queries'
import { ProductsByCategory } from './components/products-by-category'


export default function Categoria({ nombre }: { nombre: string }) {
  const { data: categorias } = useCategorias()
  const categoria = categorias?.data.find(c => c.nombre.toLowerCase() === nombre.toLowerCase())
  const categoriaId = categoria?.id || ''
  const [activeTab, setActiveTab] = React.useState(categoriaId)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    if (categoriaId) {
      setActiveTab(categoriaId)
    }
  }, [categoriaId])

  return (
    <div className="px-4 md:px-8 pt-4 ">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full rounded-md border whitespace-nowrap hidden md:block">
          <TabsList className="hidden sm:flex h-20 gap-2 px-4 ">
            {categorias?.data.map((categoria) => (
              <Link key={categoria.id} to="/categoria/$name" params={{ name: categoria.nombre.toLowerCase() }}
                className={`${activeTab === categoria.id ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger key={categoria.id} value={categoria.id} className="whitespace-nowrap p-3 hover:opacity-70 ">
                      <img src={categoria.imagen_url || ''} alt={categoria.nombre} className="size-16" />
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{categoria.nombre}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="sm:hidden mb-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {categorias?.data.find(categoria => categoria.id === activeTab)?.nombre || 'Categorías'}
                <span className="ml-2">☰</span>
              </Button>
            </SheetTrigger>
            <SheetContent className='p-4' side="left">
              <SheetTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-black">Wolf</span>
                  <span className="text-red-500 font-bold text-lg">+</span>
                  <span className="text-xs text-gray-500 ml-1">STREAMING</span>
                </div>
              </SheetTitle>
              <SheetDescription>
                Selecciona una categoría para ver los productos disponibles.
              </SheetDescription>
              <div className="flex flex-col gap-2 mt-8">
                {categorias?.data.map((categoria) => (
                  <Button
                    key={categoria.id}
                    variant={activeTab === categoria.id ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => {
                      setActiveTab(categoria.id)
                      setIsOpen(false)
                    }}
                  >
                    {categoria.nombre}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {categorias?.data.map((categoria) => (
          <TabsContent key={categoria.id} value={categoria.id}>
            <ProductsByCategory categoriaId={categoria.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

