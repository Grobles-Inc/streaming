-- Migration: Fix compras table structure
-- Date: 2025-06-30
-- Description: Add missing columns and update constraints

-- Add missing columns to compras table
ALTER TABLE compras 
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS monto_reembolso DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update estado column to use correct values
ALTER TABLE compras 
DROP CONSTRAINT IF EXISTS compras_estado_check;

ALTER TABLE compras 
ADD CONSTRAINT compras_estado_check 
CHECK (estado IN ('resuelto', 'vencido', 'soporte', 'reembolsado'));

-- Update existing records to use new estados (if any exist)
-- Note: This assumes there are no existing records or they use the old estados
UPDATE compras 
SET estado = CASE 
    WHEN estado = 'pendiente' THEN 'soporte'
    WHEN estado = 'entregado' THEN 'resuelto'
    WHEN estado = 'en_proceso' THEN 'soporte'
    WHEN estado = 'cancelado' THEN 'vencido'
    ELSE estado
END
WHERE estado NOT IN ('resuelto', 'vencido', 'soporte', 'reembolsado');

-- Add index for vendedor_id for better performance
CREATE INDEX IF NOT EXISTS idx_compras_vendedor_id ON compras(vendedor_id);

-- Add index for estado for better filtering performance
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);

-- Verify the table structure
\d compras;
