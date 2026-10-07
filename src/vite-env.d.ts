/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public site key for the Cloudflare Turnstile widget. Safe to expose. */
  readonly VITE_TURNSTILE_SITE_KEY: string
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}
