# What component is shown when clicking "Agregar stock"

## 1. stock-page.tsx
Clicking the **"Agregar Stock"** button (top-right) shows the **`AgregarStockStockModal`** component.

- A standalone modal dialog for adding new stock entries
- Features a product selector, tipo (cuenta/perfiles/combo), and type-specific fields (email, clave, url, perfil, pin)
- Imported from `./components/agregar-stock-stock-modal`
- Used in the proveedor stock management page

## 2. productos-columns.tsx
Clicking "Agregar stock" flows through two components:

1. **`DataTableRowActions`** dropdown (three dots on product row) → opens **`GestionarExistenciasModal`**
2. Inside **`GestionarExistenciasModal`**, clicking **"Agregar Stock"** (or "Agregar Primera Existencia") shows **`AgregarStockModal`**

- **`AgregarStockModal`** takes an optional `productoId` prop; if provided, the product displays in read-only mode
- Otherwise shows a product selector with the same tipo/campos structure
- Imported from `./agregar-stock-modal`
- Used when managing stock from the product detail view