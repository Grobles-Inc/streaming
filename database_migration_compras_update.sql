-- Agregar campos necesarios para reembolsos a la tabla compras
ALTER TABLE compras ADD COLUMN IF NOT EXISTS monto_reembolso DECIMAL(10,2) DEFAULT 0;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

-- Actualizar los estados de compra disponibles
UPDATE compras SET estado = 'pendiente' WHERE estado NOT IN ('pendiente', 'entregado', 'cancelado', 'reembolsado', 'en_proceso');

-- Crear función RPC para incrementar balance de usuario si no existe
CREATE OR REPLACE FUNCTION increment_user_balance(user_id UUID, amount DECIMAL)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Actualizar el balance del usuario
    UPDATE usuarios 
    SET balance = balance + amount, 
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Verificar que se actualizó correctamente
    IF FOUND THEN
        SELECT json_build_object(
            'success', true,
            'user_id', user_id,
            'amount_added', amount,
            'message', 'Balance updated successfully'
        ) INTO result;
    ELSE
        SELECT json_build_object(
            'success', false,
            'user_id', user_id,
            'amount_added', amount,
            'message', 'User not found'
        ) INTO result;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para usar la función
GRANT EXECUTE ON FUNCTION increment_user_balance(UUID, DECIMAL) TO authenticated;
