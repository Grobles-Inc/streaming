-- Script de prueba para el sistema de comisión de publicación
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la configuración actual
SELECT 
  id,
  comision_publicacion_producto,
  updated_at
FROM configuracion 
ORDER BY updated_at DESC 
LIMIT 1;

-- 2. Verificar usuarios y sus billeteras
SELECT 
  u.id,
  u.nombres,
  u.apellidos,
  u.rol,
  b.id as billetera_id,
  b.saldo,
  b.updated_at
FROM usuarios u 
LEFT JOIN billeteras b ON u.id = b.usuario_id 
WHERE u.rol IN ('provider', 'admin')
ORDER BY u.rol, u.nombres;

-- 3. Verificar productos en borrador
SELECT 
  p.id,
  p.nombre,
  p.estado,
  p.proveedor_id,
  u.nombres as proveedor_nombres,
  u.apellidos as proveedor_apellidos
FROM productos p
JOIN usuarios u ON p.proveedor_id = u.id
WHERE p.estado = 'borrador'
ORDER BY p.created_at DESC;

-- 4. OPCIONAL: Configurar comisión de prueba (ajustar valor según necesidad)
-- UPDATE configuracion 
-- SET comision_publicacion_producto = 10.00,
--     updated_at = NOW()
-- WHERE id = (SELECT id FROM configuracion ORDER BY updated_at DESC LIMIT 1);

-- 5. OPCIONAL: Agregar saldo a un proveedor para pruebas
-- UPDATE billeteras 
-- SET saldo = saldo + 50.00,
--     updated_at = NOW()
-- WHERE usuario_id = (
--   SELECT id FROM usuarios 
--   WHERE rol = 'provider' 
--   LIMIT 1
-- );

-- 6. Verificar que existe al menos un admin
SELECT COUNT(*) as admin_count
FROM usuarios 
WHERE rol = 'admin';

-- Si no hay admins, crear uno o cambiar rol de un usuario existente:
-- UPDATE usuarios 
-- SET rol = 'admin' 
-- WHERE id = 'ID_DEL_USUARIO_A_CONVERTIR_EN_ADMIN';
