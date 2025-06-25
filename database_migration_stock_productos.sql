-- Migración para agregar tabla stock_productos y campo stock_de_productos
-- Ejecutar este script en la base de datos para aplicar los cambios

-- 1. Agregar campo stock_de_productos a la tabla productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_de_productos JSONB DEFAULT '[]'::jsonb;

-- 2. Crear tabla stock_productos
CREATE TABLE IF NOT EXISTS stock_productos (
    id SERIAL PRIMARY KEY,
    email TEXT,
    clave TEXT,
    pin TEXT,
    perfil TEXT,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('cuenta', 'perfiles', 'combo')),
    url TEXT,
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido')),
    publicado BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Agregar campo stock_producto_id a la tabla compras (si no existe)
ALTER TABLE compras ADD COLUMN IF NOT EXISTS stock_producto_id INTEGER REFERENCES stock_productos(id) ON DELETE SET NULL;

-- 4. Crear índices para stock_productos
CREATE INDEX IF NOT EXISTS idx_stock_productos_producto_id ON stock_productos(producto_id);
CREATE INDEX IF NOT EXISTS idx_stock_productos_estado ON stock_productos(estado);
CREATE INDEX IF NOT EXISTS idx_stock_productos_tipo ON stock_productos(tipo);
CREATE INDEX IF NOT EXISTS idx_compras_stock_producto_id ON compras(stock_producto_id);

-- 5. Crear trigger para updated_at en stock_productos
CREATE TRIGGER update_stock_productos_updated_at 
    BEFORE UPDATE ON stock_productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS para stock_productos
ALTER TABLE stock_productos ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS para stock_productos
DROP POLICY IF EXISTS "Providers can view their own product stock" ON stock_productos;
CREATE POLICY "Providers can view their own product stock" ON stock_productos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM productos 
            WHERE productos.id = stock_productos.producto_id 
            AND productos.proveedor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Providers can manage their own product stock" ON stock_productos;
CREATE POLICY "Providers can manage their own product stock" ON stock_productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM productos 
            WHERE productos.id = stock_productos.producto_id 
            AND productos.proveedor_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM usuarios 
                WHERE id = auth.uid() AND rol = 'provider'
            )
        )
    ); 