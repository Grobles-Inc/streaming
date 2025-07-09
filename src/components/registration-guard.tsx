import { useEffect, useState } from 'react'
import { Navigate } from '@tanstack/react-router'
import { RegistrationTokenValidator } from '@/lib/registration-token-validator'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface RegistrationGuardProps {
  token?: string
  children: React.ReactNode
}

/**
 * Componente que protege las rutas de registro validando tokens
 */
export function RegistrationGuard({ token, children }: RegistrationGuardProps) {
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const validateAccess = async () => {
      if (!token) {
        setIsValid(false)
        setValidating(false)
        return
      }

      const result = await RegistrationTokenValidator.isRegistrationAllowed(token)
      setIsValid(result.allowed)
      setValidating(false)
    }

    validateAccess()
  }, [token])

  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <div>
                <h3 className="font-semibold">Verificando acceso</h3>
                <p className="text-sm text-muted-foreground">
                  Validando permisos de registro...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no tiene token o es inválido, redirigir al login
  if (!isValid) {
    return <Navigate to="/sign-in" replace />
  }

  // Si el token es válido, mostrar el contenido
  return <>{children}</>
}
