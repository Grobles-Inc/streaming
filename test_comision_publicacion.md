# Test de Comisión de Publicación de Productos

## Descripción del Sistema Implementado

Se ha implementado un sistema que cobra automáticamente una comisión cuando un producto cambia de estado "borrador" a "publicado".

### Flujo del Sistema:

1. **Cuando un producto pasa de "borrador" a "publicado":**
   - Se obtiene la comisión configurada desde la tabla `configuracion.comision_publicacion_producto`
   - Se verifica que el proveedor tenga saldo suficiente en su billetera
   - Se descuenta la comisión del saldo del proveedor
   - Se acredita la comisión al saldo del administrador
   - Si no hay saldo suficiente, se muestra un error

### Archivos Modificados:

1. **`src/features/admin/productos/services/productos.service.ts`**
   - Agregado método `procesarComisionPublicacion()`
   - Modificado `cambiarEstadoProducto()` para procesar comisión

2. **`src/features/admin/productos/components/productos-table.tsx`**
   - Mejorado manejo de errores con mensajes específicos
   - Agregado toast de notificaciones

### Casos de Uso:

#### ✅ Caso Exitoso:
- Proveedor tiene saldo suficiente
- Se descuenta comisión del proveedor
- Se acredita comisión al admin
- Producto se publica exitosamente

#### ❌ Caso de Error:
- Proveedor no tiene saldo suficiente
- Se muestra error específico
- El producto NO se publica
- Los saldos permanecen sin cambios

### Para Probar:

1. **Configurar comisión:**
   ```sql
   UPDATE configuracion 
   SET comision_publicacion_producto = 10.00 
   WHERE id = (SELECT id FROM configuracion ORDER BY updated_at DESC LIMIT 1);
   ```

2. **Verificar saldos:**
   ```sql
   SELECT u.nombres, u.apellidos, u.rol, b.saldo 
   FROM usuarios u 
   JOIN billeteras b ON u.id = b.usuario_id 
   WHERE u.rol IN ('provider', 'admin');
   ```

3. **Crear producto en borrador:**
   - Ir a admin → productos
   - Crear nuevo producto con estado "borrador"

4. **Intentar publicar:**
   - Cambiar estado a "publicado"
   - Verificar que se descuente la comisión

### Logs:
El sistema registra logs detallados en consola:
- `🔄 Procesando comisión de publicación`
- `✅ Comisión de publicación procesada exitosamente`
- `❌ Error al procesar comisión de publicación`

### Seguridad:
- Transacciones atómicas: si falla algún paso, se revierte todo
- Validación de saldos antes de procesar
- Verificación de existencia de billeteras
- Manejo de errores robusto
