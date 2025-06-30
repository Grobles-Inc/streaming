# Instrucciones para aplicar la migración de la base de datos

## Aplicar la migración

1. **Conectarse a tu base de datos PostgreSQL/Supabase**:
   - Si usas Supabase: Ve al Dashboard > SQL Editor
   - Si usas PostgreSQL local: `psql -U username -d database_name`

2. **Ejecutar el archivo de migración**:
   ```sql
   -- Copia y pega el contenido de database_migration_compras_fix.sql
   ```

3. **Verificar que la tabla se actualizó correctamente**:
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'compras' 
   ORDER BY ordinal_position;
   ```

## Verificar estructura esperada

La tabla `compras` debería tener estas columnas:
- `id` (UUID, Primary Key)
- `proveedor_id` (UUID, Foreign Key a usuarios)
- `producto_id` (UUID, Foreign Key a productos)
- `vendedor_id` (UUID, Foreign Key a usuarios, NULLABLE) ← **NUEVA**
- `stock_producto_id` (INTEGER, Foreign Key a stock_productos, NULLABLE)
- `email_cuenta` (TEXT)
- `clave_cuenta` (TEXT)
- `pin_cuenta` (TEXT, NULLABLE)
- `perfil_usuario` (TEXT, NULLABLE)
- `nombre_cliente` (TEXT)
- `telefono_cliente` (TEXT)
- `precio` (DECIMAL)
- `estado` (TEXT con CHECK constraint: 'resuelto', 'vencido', 'soporte', 'reembolsado')
- `monto_reembolso` (DECIMAL, DEFAULT 0) ← **NUEVA**
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Después de aplicar la migración

Reinicia el servidor de desarrollo:
```bash
npm run dev
```
