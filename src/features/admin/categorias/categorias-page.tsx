import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategorias, useProductosByCategoria } from './queries'
import { CategoriaForm, CategoriasTable, ProductosPorCategoria } from './components'
import { CategoriaFilters } from './components/categoria-filters'
import type { Categoria, Producto } from './data/types'

export default function CategoriasPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null)
  const [categoriaPagina, setCategoriaPagina] = useState(0)
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null)
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([])

  const {
    categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
  } = useCategorias()

  const {
    productos: productosPorCategoria,
    loading: loadingProductos,
    error: errorProductos,
    updateProducto,
    deleteProducto
  } = useProductosByCategoria(categoriaSeleccionada?.id || null)

  // Función para manejar la creación o actualización de categorías
  const handleSubmitCategoria = async (data: { nombre: string; descripcion: string; imagen_url: string }) => {
    try {
      if (editandoCategoria) {
        await updateCategoria(editandoCategoria.id, data)
        setEditandoCategoria(null)
      } else {
        await createCategoria(data)
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error)
    }
  }

  // Función para manejar la edición
  const handleEditCategoria = (categoria: Categoria) => {
    setEditandoCategoria(categoria)
  }

  // Función para manejar la eliminación
  const handleDeleteCategoria = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await deleteCategoria(id)
        if (categoriaSeleccionada?.id === id) {
          setCategoriaSeleccionada(null)
        }
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
      }
    }
  }

  // Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditandoCategoria(null)
  }

  // Función para seleccionar una categoría
  const handleSelectCategoria = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria)
  }

  // Función para manejar la actualización de productos
  const handleProductoUpdate = (productoActualizado: Producto) => {
    updateProducto(productoActualizado)
  }

  // Función para manejar la eliminación de productos
  const handleProductoDelete = (id: string) => {
    deleteProducto(id)
  }

  // Función para manejar el filtrado de categorías
  const handleCategoriaFilter = (filteredCategorias: Categoria[]) => {
    setCategoriasFiltradas(filteredCategorias)
  }

  // Categorías a mostrar (filtradas o todas)
  const categoriasAMostrar = categoriasFiltradas.length > 0 || categorias.length === 0 ? categoriasFiltradas : categorias

  if (loadingCategorias) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando categorías...</div>
        </CardContent>
      </Card>
    )
  }

  if (errorCategorias) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error: {errorCategorias}</div>
        </CardContent>
      </Card>
    )
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
        <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>Gestiona las categorías de servicios.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros de categorías */}
        <CategoriaFilters
          categorias={categorias}
          onFilter={handleCategoriaFilter}
          className="mb-6"
        />

        {/* Formulario de categorías */}
        <CategoriaForm
          categoria={editandoCategoria}
          onSubmit={handleSubmitCategoria}
          onCancel={handleCancelEdit}
          isEditing={!!editandoCategoria}
        />

        {/* Tabla de categorías */}
        <CategoriasTable
          categorias={categoriasAMostrar}
          currentPage={categoriaPagina}
          onEdit={handleEditCategoria}
          onDelete={handleDeleteCategoria}
          onSelect={handleSelectCategoria}
          onPageChange={setCategoriaPagina}
        />

        {/* Productos por categoría */}
        {categoriaSeleccionada && (
          <>
            {loadingProductos && (
              <div className="mt-4 p-4 text-center">Cargando productos...</div>
            )}
            
            {errorProductos && (
              <div className="mt-4 p-4 text-center text-red-600">Error: {errorProductos}</div>
            )}
            
            {!loadingProductos && !errorProductos && (
              <ProductosPorCategoria
                categoria={categoriaSeleccionada}
                productos={productosPorCategoria}
                onProductoUpdate={handleProductoUpdate}
                onProductoDelete={handleProductoDelete}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
      </Main>
    </>
  )
}