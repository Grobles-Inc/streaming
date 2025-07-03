-- Consulta para verificar el constraint actual de la tabla usuarios
-- Ejecuta estas consultas en tu base de datos para investigar el problema

-- 1. Ver todos los constraints de la tabla usuarios
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    cc.check_clause,
    tc.table_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'usuarios'
  AND tc.table_schema = 'public';

-- 2. Ver específicamente el constraint del rol
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%rol%' 
   OR check_clause LIKE '%rol%';

-- 3. Intentar insertar directamente un usuario con rol 'registrado' para ver el error exacto
-- INSERT INTO usuarios (
--   nombres, apellidos, email, usuario, password, telefono, rol, codigo_referido
-- ) VALUES (
--   'Test', 'Usuario', 'test@test.com', 'testuser', 'password', '123456789', 'registrado', 'TEST123'
-- );

-- 4. Ver todos los roles existentes en la tabla
SELECT DISTINCT rol FROM usuarios;
