import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useNavigate } from '@tanstack/react-router'
import { destacados, masVendidos, menuTabs, services } from './data/sample'
import ServiceCard from './service-card'
import React from 'react'

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = React.useState(menuTabs[0].key)
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className="min-h-screen bg-base-100">
      {/* Top bar */}
      <nav className="flex flex-col md:flex-row md:items-center md:justify-between md:px-6 px-4 py-4 gap-4 bg-base-100 shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-black">Wolf</span>
          <span className="text-red-500 font-bold text-lg">+</span>
          <span className="text-xs text-gray-500 ml-1">STREAMING</span>
        </div>
        <div className="flex-1 md:mx-8">
          <Input
            type="text"
            placeholder="¿Qué estás buscando?"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate({ to: '/sign-in' })}>Iniciar Sesión</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/apps' })}>Dashboard</Button>
        </div>
      </nav>
      {/* Menu as Tabs (responsive) */}
      <div className="px-4 md:px-8 pt-4">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2 pt-4">
                {services.filter(s => s.tab === tab.key).map((service) => (
                  <ServiceCard key={service.name} service={service} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {/* Productos Destacados */}
      <div className="md:px-8 px-4 pt-12">
        <h2 className="text-2xl font-bold mb-4">Productos Destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2">
          {destacados.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
      {/* Los más vendidos */}
      <div className="md:px-8 px-4 pt-12 pb-12">
        <h2 className="text-2xl font-bold mb-4">Los más vendidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-6 gap-2">
          {masVendidos.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}
