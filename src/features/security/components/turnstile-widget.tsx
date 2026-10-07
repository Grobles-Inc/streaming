import { useEffect, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type TurnstileRenderOptions,
  loadTurnstile,
} from '../api/turnstile-loader'
import { type GateAction, isGateBypassed } from '../api/verify-gate'

interface TurnstileWidgetProps {
  action: GateAction
  onTokenChange: (token: string | null) => void
  /** Bump to force a fresh challenge, e.g. after a rejected submit. */
  resetKey?: number
  className?: string
}

export function TurnstileWidget({
  action,
  onTokenChange,
  resetKey = 0,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const onTokenChangeRef = useRef(onTokenChange)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Kept in a ref so a new inline arrow from the parent does not re-render the
  // widget, which would throw away a solved challenge.
  onTokenChangeRef.current = onTokenChange

  // Mount once per action. Remounting on every reset would drop the iframe and
  // re-run the whole challenge; reset() below handles that in place instead.
  useEffect(() => {
    if (isGateBypassed()) return

    let disposed = false
    setLoadError(null)

    loadTurnstile()
      .then(() => {
        const container = containerRef.current
        const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY
        if (disposed || !container || !window.turnstile || !sitekey) return

        const options: TurnstileRenderOptions = {
          sitekey,
          action,
          appearance: 'always',
          theme: document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light',
          callback: (token) => onTokenChangeRef.current(token),
          'expired-callback': () => onTokenChangeRef.current(null),
          'timeout-callback': () => onTokenChangeRef.current(null),
          'error-callback': () => onTokenChangeRef.current(null),
        }

        widgetIdRef.current = window.turnstile.render(container, options)
      })
      .catch((error: Error) => {
        if (!disposed) setLoadError(error.message)
      })

    return () => {
      disposed = true
      const widgetId = widgetIdRef.current
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId)
        widgetIdRef.current = undefined
      }
    }
  }, [action])

  // Turnstile tokens are single use, so the challenge has to be invalidated
  // after every submit. Runs on mount too, where it is a no-op because there is
  // nothing solved yet.
  useEffect(() => {
    const widgetId = widgetIdRef.current
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId)
    }
    onTokenChangeRef.current(null)
  }, [resetKey])

  if (isGateBypassed()) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div ref={containerRef} />
      {loadError && (
        <p className='text-destructive flex items-center gap-2 text-sm'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          {loadError}
        </p>
      )}
    </div>
  )
}
