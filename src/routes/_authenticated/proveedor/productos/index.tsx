import { createFileRoute } from '@tanstack/react-router'
import { ProductosPage } from '@/features/proveedor/productos'

export const Route = createFileRoute('/_authenticated/proveedor/productos/')({
  component: ProductosPage,
}) 