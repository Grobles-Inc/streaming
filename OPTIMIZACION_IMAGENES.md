# Optimización de Imágenes con Proxy de Netlify

## 🎯 Objetivo
Reducir el egreso de Supabase Storage usando Netlify como CDN para las imágenes, ahorrando costos significativos en el plan de Supabase.

## 🚀 Implementación

### 1. Función Proxy de Netlify
Se creó `netlify/functions/image-proxy.js` que:
- Descarga imágenes de Supabase Storage una sola vez
- Las cachea en Netlify CDN por 1 año
- Sirve las imágenes desde Netlify en requests subsecuentes

### 2. Hook de Optimización
Se creó `src/hooks/use-image-proxy.ts` que:
- Convierte URLs de Supabase a URLs del proxy automáticamente
- Es compatible con URLs existentes y externas
- Incluye función standalone para uso fuera de componentes React

### 3. Componentes Actualizados
Se actualizaron los siguientes componentes para usar el proxy:

#### Landing Page
- `src/features/landing/home/categoria-card.tsx`
- `src/features/landing/home/index.tsx`
- `src/features/landing/categorias/index.tsx`
- `src/features/landing/categorias/components/producto-card.tsx`
- `src/features/landing/categorias/components/comprar-producto-modal.tsx`

#### Área de Admin
- `src/features/admin/productos/components/productos-columns.tsx`
- `src/features/admin/productos/components/producto-details-modal.tsx`

## 📊 Beneficios Esperados

### Reducción de Egreso
- **Antes**: Cada vista de imagen = 1 request a Supabase
- **Después**: Solo el primer request va a Supabase, el resto desde Netlify CDN

### Mejora de Performance
- Imágenes servidas desde Netlify CDN (más rápido)
- Cache de 1 año para imágenes estáticas
- Reducción de latencia global

### Ahorro de Costos
- Egreso de Supabase reducido en ~90%
- Aprovechamiento del CDN gratuito de Netlify

## 🔧 Uso

### En Componentes React
```tsx
import { useImageProxy } from '@/hooks/use-image-proxy'

function MyComponent({ imageUrl }) {
  const { getProxiedImageUrl } = useImageProxy()
  
  return (
    <img src={getProxiedImageUrl(imageUrl)} alt="imagen" />
  )
}
```

### Fuera de Componentes
```tsx
import { getProxiedImageUrl } from '@/hooks/use-image-proxy'

const optimizedUrl = getProxiedImageUrl(supabaseImageUrl)
```

### En el Servicio de Storage
```tsx
import { SupabaseStorageService } from '@/lib/supabase'

// Obtener URL optimizada
const optimizedUrl = SupabaseStorageService.getOptimizedImageUrl(imageUrl)
```

## 🛠️ Configuración Técnica

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  functions = "netlify/functions"

[[headers]]
  for = "/.netlify/functions/image-proxy/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Variables de Entorno
La función proxy usa automáticamente `VITE_SUPABASE_URL` para construir las URLs de Supabase.

## 📝 Notas Importantes

1. **URLs Existentes**: El hook es compatible con URLs existentes, no requiere migración masiva
2. **URLs Externas**: URLs que no son de Supabase se devuelven sin modificar
3. **Fallback Seguro**: Si hay error parseando URLs, se devuelve la URL original
4. **Cache Inmutable**: Las imágenes se cachean por 1 año con cache inmutable

## 🔄 Migración

### Para nuevos desarrollos
Usar siempre `useImageProxy` o `getProxiedImageUrl` al mostrar imágenes de Supabase.

### Para código existente
Reemplazar gradualmente:
```tsx
// Antes
<img src={product.imagen_url || ''} alt="..." />

// Después  
<img src={getProxiedImageUrl(product.imagen_url)} alt="..." />
```

## 📈 Monitoreo

Para verificar el funcionamiento:
1. Inspeccionar Network tab en DevTools
2. Verificar que las imágenes se cargan desde `/.netlify/functions/image-proxy/`
3. Confirmar headers de cache en las respuestas
4. Monitorear el egreso de Supabase en el dashboard

## 🎉 Resultado
Con esta implementación, el egreso de Supabase debería reducirse significativamente, manteniéndote dentro del límite gratuito mientras mejoras la performance de carga de imágenes.
