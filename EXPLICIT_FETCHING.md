# EXPLICIT_FETCHING.md

## Objetivo

Reducir egress cacheado de Supabase y mejorar consultas, seleccionando solo las columnas necesarias en lugar de `*`/select vacío.

## Alcance aplicado (lecturas)

- proveedor/productos: consultas de productos (incl. joins y paginación) con columnas explícitas.
- users: `getUsers`, búsqueda por código referido.
- admin/retiros: lecturas/updates de retiros con columnas explícitas.
- vendedor/admin recargas: todas las lecturas `*` reemplazadas.
- admin/reportes-globales: usuarios, productos y recargas (incl. fallbacks) con columnas explícitas.
- landing: categorías, configuración, productos y stock (paginado) con columnas explícitas.
- vendedor/compras, proveedor/billetera, proveedor/pedidos: lecturas con columnas explícitas.
- admin/configuracion-sistema y categorias: consultas con columnas explícitas.
- stores/authStore y services/index: lecturas de usuarios/billeteras con columnas explícitas.

## Pendientes (GitHub issue)

- Mutaciones `.select('*')`/`.select()` en los features anteriores.
- Features restantes: billetera, pedidos (mutaciones), productos admin, stock, otros servicios shared.
- Revisar realtime subscriptions sin filtros, imágenes sin proxy y hooks legacy que traen tablas completas.
- Evaluar RPCs para agregaciones/paginación pesada.

## Next Steps

1. Crear issue con checklist por feature (mutaciones y features pendientes).
2. Aplicar mismo patrón a mutaciones críticas (retornar solo columnas usadas).
3. Revisar componentes/mappers para evitar columnas omitidas.
4. Medir egress antes/después en Supabase.
5. Considerar RPCs solo para consultas complejas (filtros/paginación server-side).
