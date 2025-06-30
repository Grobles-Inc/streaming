-- Migración para agregar políticas RLS para la tabla retiros
-- Se debe ejecutar en Supabase después de crear la tabla retiros

-- Habilitar RLS para la tabla retiros
ALTER TABLE retiros ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para retiros
CREATE POLICY "Users can view their own withdrawals" ON retiros
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Users can create their own withdrawals" ON retiros
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins can view all withdrawals" ON retiros
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

CREATE POLICY "Admins can update withdrawal status" ON retiros
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Política adicional para permitir a los proveedores ver sus propios retiros
CREATE POLICY "Providers can view their own withdrawals" ON retiros
    FOR SELECT USING (
        usuario_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'provider'
        )
    );

-- Política adicional para permitir a los proveedores crear sus propios retiros
CREATE POLICY "Providers can create their own withdrawals" ON retiros
    FOR INSERT WITH CHECK (
        usuario_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND rol = 'provider'
        )
    );
