export async function handler(event) {
  try {
    // Extraer el path de la imagen desde la URL
    const imagePath = event.path.replace('/.netlify/functions/image-proxy/', '');
    
    // Validar que el path no esté vacío
    if (!imagePath) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Path de imagen requerido' }),
      };
    }

    // Construir la URL completa de Supabase
    const supabaseProjectId = process.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
    if (!supabaseProjectId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'URL de Supabase no configurada' }),
      };
    }

    const imageUrl = `https://${supabaseProjectId}.supabase.co/storage/v1/object/public/${imagePath}`;

    // Descargar la imagen desde Supabase
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Imagen no encontrada' }),
      };
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 año
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Netlify-CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error en image-proxy:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' }),
    };
  }
}
