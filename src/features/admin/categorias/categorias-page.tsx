import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { IconEye } from '@tabler/icons-react'

type Categoria = {
  id: string
  nombre: string
  descripcion?: string
}

type Producto = {
  id: string
  categoriaId: string
  nombre: string
  proveedor: string
  condiciones: string
  precio: number
  stock: number
  imagen: string
  celularProveedor: string
}

const categoriasEjemplo: Categoria[] = [
  { id: '1', nombre: 'Netflix', descripcion: 'Películas y series' },
  { id: '2', nombre: 'Spotify', descripcion: 'Música en streaming' },
]

const productosEjemplo: Producto[] = [
  {
    id: 'p1',
    categoriaId: '1',
    nombre: 'Netflix Premium 4K',
    proveedor: 'Juan Pérez',
    condiciones: 'No cambiar contraseña',
    precio: 120,
    stock: 5,
    imagen: 'https://i.imgur.com/YOwQF4F.jpg',
    celularProveedor: '555-1234',
  },
  {
    id: 'p2',
    categoriaId: '1',
    nombre: 'Netflix Familiar',
    proveedor: 'Ana Gómez',
    condiciones: 'Solo 1 dispositivo',
    precio: 90,
    stock: 2,
    imagen: 'https://i.imgur.com/YOwQF4F.jpg',
    celularProveedor: '555-5678',
  },
  {
    id: 'p3',
    categoriaId: '2',
    nombre: 'Spotify Family',
    proveedor: 'Carlos Ruiz',
    condiciones: 'No compartir fuera del hogar',
    precio: 60,
    stock: 10,
    imagen: 'https://i.imgur.com/7QF4F4F.jpg',
    celularProveedor: '555-8765',
  },
]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasEjemplo)
  const [productos] = useState<Producto[]>(productosEjemplo)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null)
  const [imagenExpandida, setImagenExpandida] = useState<string | null>(null)

  function handleAgregar() {
    if (!nombre) return
    setCategorias([...categorias, { id: Date.now().toString(), nombre, descripcion }])
    setNombre('')
    setDescripcion('')
  }

  function handleEliminar(id: string) {
    setCategorias(categorias.filter(c => c.id !== id))
    if (editId === id) {
      setEditId(null)
      setNombre('')
      setDescripcion('')
    }
    if (categoriaSeleccionada?.id === id) {
      setCategoriaSeleccionada(null)
    }
  }

  function handleEditar(cat: Categoria) {
    setEditId(cat.id)
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion || '')
  }

  function handleActualizar() {
    setCategorias(categorias.map(cat =>
      cat.id === editId ? { ...cat, nombre, descripcion } : cat
    ))
    setEditId(null)
    setNombre('')
    setDescripcion('')
  }

  function handleCancelar() {
    setEditId(null)
    setNombre('')
    setDescripcion('')
  }

  function handleSeleccionarCategoria(cat: Categoria) {
    setCategoriaSeleccionada(cat)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>
          Haz clic en una categoría para ver sus productos/anuncios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            editId ? handleActualizar() : handleAgregar()
          }}
          className="flex gap-2 mb-4"
        >
          <Input
            placeholder="Nombre de la categoría"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
          <Input
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
          <Button type="submit">{editId ? 'Actualizar' : 'Agregar'}</Button>
          {editId && (
            <Button type="button" variant="outline" onClick={handleCancelar}>
              Cancelar
            </Button>
          )}
        </form>
        <table className="w-full text-sm text-left mb-6">
          <thead>
            <tr>
              <th className="pr-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr
                key={cat.id}
                className={`border-b cursor-pointer ${categoriaSeleccionada?.id === cat.id ? 'bg-muted' : ''}`}
                onClick={() => handleSeleccionarCategoria(cat)}
              >
                <td className="pr-4 py-4 text-left">{cat.nombre}</td>
                <td className="px-4 py-4">{cat.descripcion}</td>
                <td className="px-4 py-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleEditar(cat) }}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleEliminar(cat.id) }}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Productos de la categoría seleccionada */}
        {categoriaSeleccionada && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                Productos/Anuncios de <span className="font-semibold">{categoriaSeleccionada.nombre}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Stock</th>
                    <th className="px-4 py-2 text-left">Imagen</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Proveedor</th>
                    <th className="px-4 py-2 text-left">Condiciones</th>
                    <th className="px-4 py-2 text-left">Precio</th>
                    <th className="px-4 py-2 text-left">Celular</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.filter(p => p.categoriaId === categoriaSeleccionada.id).map(prod => (
                    <tr key={prod.id} className="border-b">
                      <td className="px-4 py-2">{prod.stock}</td>
                      <td className="px-4 py-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}>
                              <IconEye />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <img src={prod.imagen} alt={prod.nombre} className="max-w-xs max-h-80 mx-auto" />
                          </DialogContent>
                        </Dialog>
                      </td>
                      <td className="px-4 py-2">{prod.nombre}</td>
                      <td className="px-4 py-2">{prod.proveedor}</td>
                      <td className="px-4 py-2">{prod.condiciones}</td>
                      <td className="px-4 py-2">${prod.precio}</td>
                      <td className="px-4 py-2">{prod.celularProveedor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productos.filter(p => p.categoriaId === categoriaSeleccionada.id).length === 0 && (
                <div className="text-muted-foreground py-4">No hay productos/anuncios en esta categoría.</div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}