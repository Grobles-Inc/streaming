import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import { Link } from '@tanstack/react-router'
import { menuTabs, productos } from './data/sample'
import ProductoCard from './producto-card'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


export default function Categorias({ nombre }: { nombre: string }) {
  const [activeTab, setActiveTab] = React.useState(nombre)
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className="px-4 md:px-8 pt-4 ">
      <h1 className='text-xl md:text-2xl  font-bold my-2'>Categorías</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Desktop Tabs */}
        <ScrollArea className="w-full rounded-md border whitespace-nowrap hidden md:block">
          <TabsList className="hidden sm:flex h-14 gap-2 px-4 ">
            {menuTabs.map((tab) => (
              <Link key={tab.key} to="/categoria/$name" params={{ name: tab.key.toLowerCase() }} >

                <TabsTrigger key={tab.key} value={tab.key} className="whitespace-nowrap px-3 py-2 hover:opacity-70 ">
                  {tab.label}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {/* Mobile Sheet Trigger */}
        <div className="sm:hidden mb-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {menuTabs.find(t => t.key === activeTab)?.label || 'Categorías'}
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
                {menuTabs.map((tab) => (
                  <Button
                    key={tab.key}
                    variant={activeTab === tab.key ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => {
                      setActiveTab(tab.key)
                      setIsOpen(false)
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* Tab Content (services grid) */}
        {menuTabs.map((tab) => {
          const filteredProductos = productos.filter(producto => producto.categoria === tab.key)

          return (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-2 pt-4">
                {filteredProductos.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                    <p className="text-muted-foreground">
                      No se encontraron productos en esta categoría.
                    </p>
                  </div>
                ) : (
                  filteredProductos.map((producto) => (
                    <ProductoCard key={producto.titulo} producto={producto} />
                  ))
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
