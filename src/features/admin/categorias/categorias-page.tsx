import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconEye, IconEdit, IconTrash, IconMenu2 } from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Categoria = {
  id: string
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  created_at: string
  updated_at: string
}

type Producto = {
  id: string
  categoria_id: string
  nombre: string
  proveedor_id: string
  condiciones: string | null
  precio_publico: number
  stock: number
  imagen_url: string | null
  created_at: string
  updated_at: string
  url_cuenta: string | null
  tiempo_uso: string | null
  descripcion_completa: string | null
  disponibilidad: string | null
  precio_vendedor: number
  precio_renovacion: number
  stock_de_producto: number
  descripcion: string | null
  categoria?: Categoria
  proveedor?: {
    id: string
    nombre: string
    apellido: string
    descripcion: string | null
    imagen_url: string | null
  }
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [_, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null)
  const [categoriaPagina, setCategoriaPagina] = useState(0)
  const [productoPagina, setProductoPagina] = useState(0)
  const [productoDetalles, setProductoDetalles] = useState<Producto | null>(null)

  // Fetch categorías desde Supabase
  useEffect(() => {
    async function fetchCategorias() {
      const { data, error } = await supabase.from('categorias').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching categorías:', error)
      } else {
        setCategorias(data || [])
      }
    }
    fetchCategorias()
  }, [])

  // Fetch productos desde Supabase
  useEffect(() => {
    async function fetchProductos() {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching productos:', error)
      } else {
        setProductos(data || [])
      }
    }
    fetchProductos()
  }, [])

  // Agregar nueva categoría
  async function handleAgregar() {
    if (!nombre) return
    const { data, error } = await supabase.from('categorias').insert({ nombre, descripcion, imagen_url: imagenUrl })
    if (error) {
      console.error('Error al agregar categoría:', error)
    } else {
      setCategorias([...(categorias || []), ...(data || [])])
      setNombre('')
      setDescripcion('')
      setImagenUrl('')
    }
  }

  // Eliminar categoría
  async function handleEliminar(id: string) {
    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) {
      console.error('Error al eliminar categoría:', error)
    } else {
      setCategorias(categorias.filter(c => c.id !== id))
      if (categoriaSeleccionada?.id === id) {
        setCategoriaSeleccionada(null)
      }
    }
  }

  // Editar categoría
  function handleEditar(cat: Categoria) {
    setEditId(cat.id)
    setNombre(cat.nombre)
    setDescripcion(cat.descripcion || '')
    setImagenUrl(cat.imagen_url || '')
  }

  // Actualizar categoría
  async function handleActualizar() {
    const { error } = await supabase.from('categorias').update({ nombre, descripcion, imagen_url: imagenUrl }).eq('id', editId)
    if (error) {
      console.error('Error al actualizar categoría:', error)
    } else {
      setCategorias(categorias.map(cat => (cat.id === editId ? { ...cat, nombre, descripcion, imagen_url: imagenUrl } : cat)))
      setEditId(null)
      setNombre('')
      setDescripcion('')
      setImagenUrl('')
    }
  }

  // Cancelar edición
  function handleCancelar() {
    setEditId(null)
    setNombre('')
    setDescripcion('')
    setImagenUrl('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>Gestiona las categorías de servicios.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={e => {
            e.preventDefault()
            editId ? handleActualizar() : handleAgregar()
          }}
          className="flex gap-2 mb-4"
        >
          <Input placeholder="Nombre de la categoría" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <Input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <Input placeholder="URL de la imagen" value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} />
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
              <th className="px-4 py-2">Creado en:</th>
              <th className="px-4 py-2">Actualizado en:</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.slice(categoriaPagina * 3, categoriaPagina * 3 + 3).map(cat => (
              <tr
                key={cat.id}
                className="border-b cursor-pointer"
                onClick={() => setCategoriaSeleccionada(cat)}
              >
                <td className="pr-4 py-4 text-left">{cat.nombre}</td>
                <td className="px-4 py-4">{cat.descripcion}</td>
                <td className="px-4 py-4">{new Date(cat.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-4">{new Date(cat.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-4">
                  {cat.imagen_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconEye />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <img src={cat.imagen_url} alt={cat.nombre} className="max-w-xs max-h-80 mx-auto" />
                      </DialogContent>
                    </Dialog>
                  )}
                </td>
                <td className="px-4 py-4 flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <IconMenu2 />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditar(cat)}>
                        <IconEdit className="mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEliminar(cat.id)}>
                        <IconTrash className="mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={categoriaPagina === 0}
            onClick={() => setCategoriaPagina(categoriaPagina - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={(categoriaPagina + 1) * 3 >= categorias.length}
            onClick={() => setCategoriaPagina(categoriaPagina + 1)}
          >
            Siguiente
          </Button>
        </div>
        {categoriaSeleccionada && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Productos de {categoriaSeleccionada.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Nombre</th>
                    <th className="px-4 py-2">Descripción</th>
                    <th className="px-4 py-2">Proveedor</th>
                    <th className="px-4 py-2">Precio</th>
                    <th className="px-4 py-2">Stock</th>
                    <th className="px-4 py-2">Imagen</th>
                    <th className="px-4 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos
                    .filter(p => p.categoria_id === categoriaSeleccionada.id)
                    .slice(productoPagina * 10, productoPagina * 10 + 10)
                    .map(prod => (
                      <tr key={prod.id} className="border-b">
                        <td className="px-4 py-2">{prod.nombre}</td>
                        <td className="px-4 py-2">{prod.descripcion || 'Sin descripción'}</td>
                        <td className="px-4 py-2">
                          {prod.proveedor ? (
                            <span>
                              {prod.proveedor.nombre} {prod.proveedor.apellido}
                            </span>
                          ) : (
                            'Sin proveedor'
                          )}
                        </td>
                        <td className="px-4 py-2">${prod.precio_publico}</td>
                        <td className="px-4 py-2">{prod.stock}</td>
                        <td className="px-4 py-2">
                          {prod.imagen_url && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <IconEye />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <img
                                  src={prod.imagen_url}
                                  alt={prod.nombre}
                                  className="max-w-xs max-h-80 mx-auto"
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <IconMenu2 />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  const detallesProducto = productos.find(p => p.id === prod.id)
                                  if (detallesProducto) {
                                    setProductoDetalles(detallesProducto)
                                    setEditMode(false)
                                  }
                                }}
                              >
                                <IconEye className="mr-2" /> Ver detalles
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={async () => {
                                  const { error } = await supabase.from('productos').delete().eq('id', prod.id)
                                  if (error) {
                                    console.error('Error al eliminar producto:', error)
                                  } else {
                                    setProductos(productos.filter(p => p.id !== prod.id))
                                  }
                                }}
                              >
                                <IconTrash className="mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  disabled={productoPagina === 0}
                  onClick={() => setProductoPagina(productoPagina - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    (productoPagina + 1) * 10 >=
                    productos.filter(p => p.categoria_id === categoriaSeleccionada.id).length
                  }
                  onClick={() => setProductoPagina(productoPagina + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {productoDetalles && (
          <Dialog open={!!productoDetalles} onOpenChange={() => setProductoDetalles(null)}>
            <DialogContent className="max-w-3xl">
              <Card className="max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Detalles del Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="space-y-6"
                    onSubmit={async e => {
                      e.preventDefault();
                      const { error } = await supabase
                        .from('productos')
                        .update(productoDetalles)
                        .eq('id', productoDetalles.id);
                      if (error) {
                        console.error('Error al actualizar producto:', error);
                      } else {
                        setProductos(
                          productos.map(p =>
                            p.id === productoDetalles.id ? { ...p, ...productoDetalles } : p
                          )
                        );
                        setProductoDetalles(null);
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <Input
                          placeholder="Nombre"
                          value={productoDetalles.nombre}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, nombre: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <Input
                          placeholder="Descripción"
                          value={productoDetalles.descripcion || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, descripcion: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">Condiciones</label>
                        <Input
                          placeholder="Condiciones"
                          value={productoDetalles.condiciones || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, condiciones: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Precio Público</label>
                        <Input
                          placeholder="Precio Público"
                          type="number"
                          value={productoDetalles.precio_publico}
                          onChange={e =>
                            setProductoDetalles({
                              ...productoDetalles,
                              precio_publico: parseFloat(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Precio Vendedor</label>
                        <Input
                          placeholder="Precio Vendedor"
                          type="number"
                          value={productoDetalles.precio_vendedor}
                          onChange={e =>
                            setProductoDetalles({
                              ...productoDetalles,
                              precio_vendedor: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Precio Renovación</label>
                        <Input
                          placeholder="Precio Renovación"
                          type="number"
                          value={productoDetalles.precio_renovacion}
                          onChange={e =>
                            setProductoDetalles({
                              ...productoDetalles,
                              precio_renovacion: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <Input
                          placeholder="Stock"
                          type="number"
                          value={productoDetalles.stock}
                          onChange={e =>
                            setProductoDetalles({
                              ...productoDetalles,
                              stock: parseInt(e.target.value, 10),
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tiempo de Uso</label>
                        <Input
                          placeholder="Tiempo de Uso"
                          value={productoDetalles.tiempo_uso || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, tiempo_uso: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">URL Imagen</label>
                        <Input
                          placeholder="URL Imagen"
                          value={productoDetalles.imagen_url || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, imagen_url: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={productoDetalles.categoria_id || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, categoria_id: e.target.value })
                          }
                          required
                        >
                          <option value="" disabled>
                            Selecciona una categoría
                          </option>
                          {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">URL Cuenta</label>
                        <Input
                          placeholder="URL Cuenta"
                          value={productoDetalles.url_cuenta || ''}
                          onChange={e =>
                            setProductoDetalles({ ...productoDetalles, url_cuenta: e.target.value })
                          }
                        />
                      </div>



                    </div>
                    <div className="flex gap-4 mt-6">
                      <Button
                        type="submit"
                        onClick={async () => {
                          const { error } = await supabase
                            .from('productos')
                            .update(productoDetalles)
                            .eq('id', productoDetalles.id);
                          if (error) {
                            console.error('Error al actualizar producto:', error);
                          } else {
                            setProductos(
                              productos.map(p =>
                                p.id === productoDetalles.id ? { ...p, ...productoDetalles } : p
                              )
                            );
                            setProductoDetalles(null);
                          }
                        }}
                      >
                        Actualizar
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setProductoDetalles(null)}>
                        Cancelar
                      </Button>

                    </div>
                  </form>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}