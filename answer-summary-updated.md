# What component is shown when clicking "Agregar stock" - UPDATED

## 1. stock-page.tsx
Clicking the **"Agregar Stock"** button (top-right) shows the **`AgregarStockStockModal`** component.

- A standalone modal dialog for adding new stock entries
- Features a product selector, tipo (cuenta/perfiles/combo), and type-specific fields (email, clave, url, perfil, pin)
- Imported from `./components/agregar-stock-stock-modal`
- Used in the proveedor stock management page

## 2. productos-columns.tsx
Clicking "Agregar stock" flows through two components:

1. **`DataTableRowActions`** dropdown (three dots on product row) → opens **`GestionarExistenciasModal`**
2. Inside **`GestionarExistenciasModal`**, clicking **"Agregar Stock"** (or "Agregar Primera Existencia") shows the **`AgregarStockModal`** component

### UI Consistency Update
The `AgregarStockModal` component has been updated to match the UI of `AgregarStockStockModal` when selecting the **PERFIL** type:

- **Label**: Changed from "Perfiles ({fields.length})" to "Cant. Perfiles: {fields.length}"
- **Button**: Added red border styling `className="text-red-500 border-red-500 hover:bg-red-50"` and `IconPlus size={16} className="mr-1"`
- **Field Layout**: Changed to `grid grid-cols-7 gap-2 items-end` to match the stock page table layout

- **`AgregarStockModal`** takes an optional `productoId` prop; if provided, the product displays in read-only mode
- Otherwise shows a product selector with the same tipo/campos structure
- Imported from `./agregar-stock-modal`
- Used when managing stock from the product detail view

### Key Difference (now resolved):
Both components now have the **same UI** when selecting PERFIL type, with consistent label, button styling, and field layout.