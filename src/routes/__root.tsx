import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={2000} richColors />
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
        <footer className="text-center text-sm text-muted-foreground py-6 border-t bg-background">
          <p>
            © {new Date().getFullYear()} <strong>ML Streaming</strong> . Todos los derechos reservados.
            <span className="mx-2">|</span>
            <a
              href="https://groblesolutions.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sitio Desarrollado por <span className="font-bold underline text-yellow-500 transition-colors">Grobles</span>
            </a>

          </p>
        </footer>
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
