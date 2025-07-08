import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { CategoriaModal, CategoriasTableDnd } from './components'
import { CategoriaFilters } from './components/categoria-filters'
import type { Categoria } from './data/types'
import { useCategorias } from './queries'

export default function CategoriasPage() {
  const [editandoCategoria, setEditandoCategoria] = useState<Categoria | null>(null)
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    categorias,
    loading: loadingCategorias,
    error: errorCategorias,
    createCategoria,
    updateCategoria,
    updateCategoriasOrden,
    moveToFirst,
    moveToLast,
    deleteCategoria
  } = useCategorias()

  // Función para manejar la creación o actualización de categorías
  const handleSubmitCategoria = async (data: { nombre: string; descripcion: string; imagen_url: string }) => {
    try {
      if (isEditing && editandoCategoria) {
        await updateCategoria(editandoCategoria.id, data)
      } else {
        await createCategoria(data)
      }
      setModalOpen(false)
      setEditandoCategoria(null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error al guardar categoría:', error)
    }
  }

  // Función para abrir modal para nueva categoría
  const handleNuevaCategoria = () => {
    setEditandoCategoria(null)
    setIsEditing(false)
    setModalOpen(true)
  }

  // Función para manejar la edición
  const handleEditCategoria = (categoria: Categoria) => {
    setEditandoCategoria(categoria)
    setIsEditing(true)
    setModalOpen(true)
  }

  // Función para manejar la eliminación
  const handleDeleteCategoria = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await deleteCategoria(id)
      } catch (error) {
        console.error('Error al eliminar categoría:', error)
      }
    }
  }

  // Función para manejar el filtrado de categorías
  const handleCategoriaFilter = (filteredCategorias: Categoria[]) => {
    setCategoriasFiltradas(filteredCategorias)
  }

  // Función para manejar el reordenamiento de categorías
  const handleReorderCategorias = async (reorderedCategorias: Categoria[]) => {
    try {
      await updateCategoriasOrden(reorderedCategorias)
    } catch (error) {
      console.error('Error al reordenar categorías:', error)
    }
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Categorías y Productos</h2>
            <p className='text-muted-foreground'>
              Gestiona las categorías de servicios y sus productos asociados.
            </p>
          </div>
          <Button onClick={handleNuevaCategoria}>
            <IconPlus className="mr-2 h-4 w-4" />
            Nueva Categoría
          </Button>
        </div>

        <CategoriaFilters
          categorias={categorias}
          onFilter={handleCategoriaFilter}
          className="mb-6"
        />
        <CategoriasTableDnd
          categorias={categoriasAMostrar}
          onEdit={handleEditCategoria}
          onDelete={handleDeleteCategoria}
          onReorder={handleReorderCategorias}
          onMoveToFirst={moveToFirst}
          onMoveToLast={moveToLast}
        />

        <CategoriaModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          categoria={editandoCategoria}
          onSubmit={handleSubmitCategoria}
          isEditing={isEditing}
        />
      </Main>
    </>
  )
}