/**
 * Loader for the Cloudflare Turnstile script.
 *
 * Kept out of the component so the widget component stays a pure renderer and
 * the "load it once, share it" bookkeeping lives in one place.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: TurnstileRenderOptions
      ) => string | undefined
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

export interface TurnstileRenderOptions {
  sitekey: string
  action: string
  theme?: 'auto' | 'light' | 'dark'
  size?: 'normal' | 'compact' | 'flexible'
  appearance?: 'always' | 'execute' | 'interaction-only'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
  'timeout-callback'?: () => void
}

// `render=explicit` so the widget only mounts when a form asks for it, rather
// than every embedded page rendering one on load.
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let pending: Promise<void> | null = null

export function loadTurnstile(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile requires a browser'))
  }
  if (window.turnstile) return Promise.resolve()
  if (pending) return pending

  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.turnstile) {
        resolve()
      } else {
        pending = null
        reject(new Error('Turnstile se cargo pero no se inicializo'))
      }
    }
    script.onerror = () => {
      pending = null
      reject(new Error('No se pudo cargar el servicio de verificacion'))
    }
    document.head.appendChild(script)
  })

  return pending
}
