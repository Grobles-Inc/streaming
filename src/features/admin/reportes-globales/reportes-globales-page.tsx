import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { IconUsers, IconPackage, IconWallet, IconCheck, IconX } from '@tabler/icons-react'

const usuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@gmail.com', rol: 'vendedor', estado: 'activo' },
    { id: 2, nombre: 'Ana Gómez', email: 'ana@gmail.com', rol: 'proveedor', estado: 'borrado' },
    // ...
]

const productos = [
    { id: 1, nombre: 'Netflix Premium', estado: 'activo' },
    { id: 2, nombre: 'Spotify Family', estado: 'borrador' },
    // ...
]

const recargas = [
    { id: 1, proveedor: 'Ana Gómez', monto: 100, estado: 'pendiente' },
    { id: 2, proveedor: 'Carlos Ruiz', monto: 200, estado: 'validado' },
    // ...
]

export default function ReportesGlobalesPage() {
    return (
        <>
            <Header>
                <div className='ml-auto flex items-center space-x-4'>
                    <Search />
                </div>
            </Header>
            <Main>
                <div className='mb-2 flex items-center justify-between space-y-2'>
                    <h1 className='text-2xl font-bold tracking-tight'>Reportes Globales</h1>
                </div>

                {/* Métricas principales */}
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-sm font-medium'>Saldo Total Recargado</CardTitle>
                            <IconWallet className='text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>$12,500</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-sm font-medium'>Productos Vendidos</CardTitle>
                            <IconPackage className='text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>1,234</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between pb-2'>
                            <CardTitle className='text-sm font-medium'>Usuarios Registrados</CardTitle>
                            <IconUsers className='text-muted-foreground' />
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>320</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="usuarios" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                        <TabsTrigger value="productos">Productos</TabsTrigger>
                        <TabsTrigger value="recargas">Recargas/Validaciones</TabsTrigger>
                    </TabsList>

                    {/* Usuarios */}
                    <TabsContent value="usuarios">
                        <Card>
                            <CardHeader>
                                <CardTitle>Usuarios</CardTitle>
                                <CardDescription>Lista de usuarios registrados</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Email</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.nombre}</td>
                                                <td>{u.email}</td>
                                                <td>{u.rol}</td>
                                                <td>
                                                    <Badge variant={u.estado === 'activo' ? 'default' : 'secondary'}>
                                                        {u.estado}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button size="sm" variant="outline">Editar</Button>
                                                    <Button size="sm" variant="destructive" className="ml-2">Eliminar</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Productos */}
                    <TabsContent value="productos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Productos</CardTitle>
                                <CardDescription>Listado de productos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.nombre}</td>
                                                <td>
                                                    <Badge variant={p.estado === 'activo' ? 'default' : 'secondary'}>
                                                        {p.estado}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button size="sm" variant="outline">Editar</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Recargas y Validaciones */}
                    <TabsContent value="recargas">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recargas y Validaciones</CardTitle>
                                <CardDescription>Validar recargas y pagos de proveedores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th>Proveedor</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recargas.map(r => (
                                            <tr key={r.id}>
                                                <td>{r.proveedor}</td>
                                                <td>${r.monto}</td>
                                                <td>
                                                    <Badge variant={r.estado === 'validado' ? 'default' : 'secondary'}>
                                                        {r.estado}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {r.estado === 'pendiente' && (
                                                        <Button size="sm" variant="default">Validar</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </Main>
        </>
    )
}