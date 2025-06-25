-- Migración para actualizar tabla productos para coincidir con tipos TypeScript
-- Ejecutar este script en la base de datos después de database_migration_stock_productos.sql

-- 1. Renombrar campo precio a precio_publico
ALTER TABLE productos RENAME COLUMN precio TO precio_publico;

-- 2. Agregar campos faltantes
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_vendedor DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS precio_renovacion DECIMAL(10,2);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tiempo_uso INTEGER NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS a_pedido BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS nuevo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS mas_vendido BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS descripcion_completa TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS disponibilidad TEXT NOT NULL DEFAULT 'en_stock' CHECK (disponibilidad IN ('en_stock', 'a_pedido', 'activacion'));
ALTER TABLE productos ADD COLUMN IF NOT EXISTS renovable BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS solicitud TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS muestra_disponibilidad_stock BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS deshabilitar_boton_comprar BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS url_cuenta TEXT;

-- 3. Actualizar campos existentes si es necesario
-- Si hay productos existentes, podemos establecer valores por defecto razonables
UPDATE productos SET 
    precio_vendedor = precio_publico * 0.8,  -- 80% del precio público como default
    disponibilidad = 'en_stock',
    renovable = false,
    destacado = false,
    mas_vendido = false,
    nuevo = false,
    a_pedido = false,
    tiempo_uso = 30,  -- 30 días por defecto
    muestra_disponibilidad_stock = true,
    deshabilitar_boton_comprar = false
WHERE precio_vendedor = 0;

-- 4. Agregar updated_at trigger si no existe para los nuevos campos
-- (El trigger ya debería existir del schema anterior) 