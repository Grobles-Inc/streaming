/**
 * Plataformas soportadas por la búsqueda IMAP (Fase 5).
 * Los slugs son los mismos del CHECK constraint `imap_configs_plataforma_check`
 * en Supabase y de la whitelist en las Netlify Functions — si agregás una acá,
 * agregala en los tres lados.
 */
export const PLATAFORMAS = [
  { value: 'netflix', label: 'Netflix' },
  { value: 'disney', label: 'Disney+' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'amazon_prime', label: 'Amazon Prime' },
  { value: 'hbo_max', label: 'HBO Max' },
  { value: 'youtube_premium', label: 'YouTube Premium' },
  { value: 'playstation', label: 'PlayStation' },
  { value: 'xbox', label: 'Xbox' },
  { value: 'crunchyroll', label: 'Crunchyroll' },
  { value: 'vix', label: 'ViX' },
  { value: 'adobe', label: 'Adobe' },
  { value: 'canva', label: 'Canva' },
  { value: 'otra', label: 'Otra (sin filtro)' },
] as const

export type Plataforma = (typeof PLATAFORMAS)[number]['value']

export const getPlataformaLabel = (
  value: string | null | undefined
): string => PLATAFORMAS.find((p) => p.value === value)?.label ?? 'Sin configurar'
