-- CONSULTAS PARA REVISAR LA ESTRUCTURA DE LA TABLA USUARIOS
-- Ejecuta estas consultas en tu base de datos para ver la configuración actual

-- 1. Ver la estructura completa de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver TODOS los constraints de la tabla usuarios (incluyendo checks)
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause,
    tc.table_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'usuarios' 
    AND tc.table_schema = 'public';

-- 3. Ver específicamente constraints relacionados con 'rol'
SELECT 
    constraint_name, 
    check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'usuarios'
    AND (constraint_name LIKE '%rol%' OR check_clause LIKE '%rol%');

-- 4. Ver todos los valores DISTINTOS de rol que existen actualmente
SELECT DISTINCT rol FROM usuarios ORDER BY rol;

-- 5. Ver el DDL completo de la tabla (si tu base de datos lo soporta)
-- En PostgreSQL:
SELECT 
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' || data_type ||
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')'
            ELSE ''
        END ||
        CASE 
            WHEN is_nullable = 'NO' 
            THEN ' NOT NULL'
            ELSE ''
        END,
        ', '
    ) || ');' as table_ddl
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
GROUP BY table_name;

-- 6. Intentar insertar un registro de prueba para ver el error exacto
-- DESCOMENTA ESTA LÍNEA SOLO PARA PROBAR:
-- INSERT INTO usuarios (nombres, apellidos, email, usuario, password, rol, codigo_referido) 
-- VALUES ('Test', 'Prueba', 'test@test.com', 'testuser', 'password', 'registrado', 'TEST123');
