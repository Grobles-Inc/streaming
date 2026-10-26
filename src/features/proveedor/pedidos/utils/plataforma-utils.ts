/**
 * Id/slug de una plataforma a partir de su label: minúsculas, todo lo no
 * alfanumérico pasa a `_`, sin `_` repetidos ni en los extremos.
 * "Universal Plus+" → "universal_plus".
 */
export const slugifyPlataforma = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

/** "Universal, universalplus " → ['universal', 'universalplus']. */
export const parseKeywords = (input: string): string[] =>
  input
    .split(',')
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)

/**
 * Mensaje de error del INSERT de plataformas. El choque de PK se reporta con el
 * slug para que el usuario entienda qué revisar; los errores de RLS se muestran
 * tal cual los devuelve Supabase.
 */
export const getCreatePlataformaError = (
  error: unknown,
  slug: string
): string => {
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as { code?: string; message?: string }
    if (code === '23505') {
      return `Ya existe una plataforma con ese identificador: ${slug}. Revisa si ya está en la lista.`
    }
    if (message) {
      return message
    }
  }
  return 'No se pudo crear la plataforma'
}
