-- Migración para agregar el rol 'registrado' al constraint de la tabla usuarios
-- Fecha: 2025-07-02

-- Primero, eliminar el constraint existente
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- Crear el nuevo constraint que incluya 'registrado'
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check 
CHECK (rol IN ('provider', 'admin', 'seller', 'registrado'));

-- Verificar que el constraint se aplicó correctamente
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'usuarios_rol_check';
