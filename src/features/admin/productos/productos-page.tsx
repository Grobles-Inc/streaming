import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Plus } from 'lucide-react'
import { ProductosTable } from './components/productos-table'
import { ProductoFormModal } from './components/producto-form-modal'
import { useProductos } from './hooks/use-productos'

export function ProductosPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { refreshProductos } = useProductos()

  const handleCreateSuccess = () => {
    refreshProductos()
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestión de productos</h1>
              <p className="text-muted-foreground">
                Administra el catálogo de productos, precios y disponibilidad.
                
              </p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar producto
            </Button>
          </div>

          {/* Tabla de productos */}
          <Card>
            
            <CardContent>
              <ProductosTable />
            </CardContent>
          </Card>

          {/* Modal de crear/editar producto */}
          <ProductoFormModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </Main>
    </>
  )
}
