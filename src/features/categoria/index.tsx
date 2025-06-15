import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import { menuTabs, productos } from '../../data/sample'
import ProductoCard from './producto-card'

export default function Categorias({ nombre }: { nombre: string }) {
  const [activeTab, setActiveTab] = React.useState(nombre)
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className="px-4 md:px-8 pt-4 ">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Desktop Tabs */}
        <TabsList className="hidden sm:flex ">
          {menuTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="whitespace-nowrap">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
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
        {menuTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  md:gap-6 gap-2 pt-4">
              {productos.filter(producto => producto.categoria === tab.key).map((producto) => (
                <ProductoCard key={producto.titulo} producto={producto} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
