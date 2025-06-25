import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { IconUsers, IconPackage, IconWallet } from '@tabler/icons-react'

type Recarga = {
    id: number;
    proveedor: string;
    monto: number;
    estado: 'pendiente' | 'validado' | 'rechazado';
};
type Usuario = {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    rol: 'admin' | 'usuario';
    estado: 'activo' | 'inactivo';
};
type Producto = {
    id: number;
    nombre: string;
    estado: 'activo' | 'inactivo';
};

export default function ReportesGlobalesPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [recargas, setRecargas] = useState<Recarga[]>([]);

    useEffect(() => {
        async function fetchUsuarios() {
            const { data, error } = await supabase.from('usuarios').select('*');
            if (error) {
                console.error('Error fetching usuarios:', error);
            } else {
                setUsuarios(data || []);
            }
        }

        async function fetchProductos() {
            const { data, error } = await supabase.from('productos').select('*');
            if (error) {
                console.error('Error fetching productos:', error);
            } else {
                setProductos(data || []);
            }
        }

        async function fetchRecargas() {
            const { data, error } = await supabase.from('recargas').select('*');
            if (error) {
                console.error('Error fetching recargas:', error);
            } else {
                setRecargas(data || []);
            }
        }

        fetchUsuarios();
        fetchProductos();
        fetchRecargas();
    }, []);

    return (
        <>
            <Header>
                <div className="ml-auto flex items-center space-x-4">
                    <Search />
                </div>
            </Header>
            <Main>
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Reportes Globales</h1>
                </div>

                {/* Métricas principales */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Total Recargado</CardTitle>
                            <IconWallet className="text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${recargas.reduce((acc, r) => acc + r.monto, 0)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
                            <IconPackage className="text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{productos.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                            <IconUsers className="text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usuarios.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="usuarios" className="space-y-6">
                    <TabsList className="mb-4">
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
                                <table className="w-full text-sm border-collapse">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Nombre</th>
                                            <th className="px-4 py-2 text-left">Email</th>
                                            <th className="px-4 py-2 text-left">Rol</th>
                                            <th className="px-4 py-2 text-left">Estado</th>
                                            <th className="px-4 py-2 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((u) => (
                                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 border-r">{u.nombres} {u.apellidos}</td>
                                                <td className="px-4 py-2 border-r">{u.email}</td>
                                                <td className="px-4 py-2 border-r">{u.rol}</td>
                                                <td className="px-4 py-2 border-r">
                                                    <Badge variant={u.estado === "activo" ? "default" : "secondary"}>
                                                        {u.estado}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
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
                                <table className="w-full text-sm border-collapse">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Nombre</th>
                                            <th className="px-4 py-2 text-left">Estado</th>
                                            <th className="px-4 py-2 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productos.map((p) => (
                                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 border-r">{p.nombre}</td>
                                                <td className="px-4 py-2 border-r">
                                                    <Badge variant={p.estado === "activo" ? "default" : "secondary"}>
                                                        {p.estado}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
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
                                <table className="w-full text-sm border-collapse">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Proveedor</th>
                                            <th className="px-4 py-2 text-left">Monto</th>
                                            <th className="px-4 py-2 text-left">Estado</th>
                                            <th className="px-4 py-2 text-left">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recargas.map((r) => (
                                            <tr key={r.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 border-r">{r.proveedor}</td>
                                                <td className="px-4 py-2 border-r">${r.monto}</td>
                                                <td className="px-4 py-2 border-r">
                                                    <Badge variant={r.estado === "validado" ? "default" : "secondary"}>
                                                        {r.estado}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {r.estado === "pendiente" && (
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={async () => {
                                                                    const { error } = await supabase
                                                                        .from('recargas')
                                                                        .update({ estado: 'validado' })
                                                                        .eq('id', r.id);
                                                                    if (error) {
                                                                        console.error('Error updating recarga:', error);
                                                                    } else {
                                                                        setRecargas((prev) =>
                                                                            prev.map((recarga) =>
                                                                                recarga.id === r.id
                                                                                    ? { ...recarga, estado: 'validado' }
                                                                                    : recarga
                                                                            )
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                Aprobar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={async () => {
                                                                    const { error } = await supabase
                                                                        .from('recargas')
                                                                        .update({ estado: 'rechazado' })
                                                                        .eq('id', r.id);
                                                                    if (error) {
                                                                        console.error('Error updating recarga:', error);
                                                                    } else {
                                                                        setRecargas((prev) =>
                                                                            prev.map((recarga) =>
                                                                                recarga.id === r.id
                                                                                    ? { ...recarga, estado: 'rechazado' }
                                                                                    : recarga
                                                                            )
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                Rechazar
                                                            </Button>
                                                        </div>
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
    );
}