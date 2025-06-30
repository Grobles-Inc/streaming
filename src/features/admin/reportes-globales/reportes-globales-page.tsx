import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { useUsuarios, useProductos, useRecargas, useMetricasGlobales } from './queries'
import { MetricasCard, UsuariosTable, ProductosTable, RecargasTable } from './components'

export default function ReportesGlobalesPage() {
  const { usuarios, loading: usuariosLoading, updateUsuario, deleteUsuario } = useUsuarios()
  const { productos, loading: productosLoading, updateProducto } = useProductos()
  const { recargas, loading: recargasLoading, updateRecarga } = useRecargas()
  const { metricas, loading: metricasLoading } = useMetricasGlobales()

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
        <MetricasCard metricas={metricas} loading={metricasLoading} />

        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="recargas">Recargas/Validaciones</TabsTrigger>
          </TabsList>

          {/* Usuarios */}
          <TabsContent value="usuarios">
            <UsuariosTable
              usuarios={usuarios}
              loading={usuariosLoading}
              onUpdateUsuario={updateUsuario}
              onDeleteUsuario={deleteUsuario}
            />
          </TabsContent>

          {/* Productos */}
          <TabsContent value="productos">
            <ProductosTable
              productos={productos}
              loading={productosLoading}
              onUpdateProducto={updateProducto}
            />
          </TabsContent>

          {/* Recargas y Validaciones */}
          <TabsContent value="recargas">
            <RecargasTable
              recargas={recargas}
              loading={recargasLoading}
              onUpdateRecarga={updateRecarga}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}