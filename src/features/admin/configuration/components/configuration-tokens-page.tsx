import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  IconShield, 
  IconRefresh, 
  IconKey, 
  IconCheck, 
  IconX, 
  IconClock,
  IconLoader
} from '@tabler/icons-react'
import { useConfiguration } from '@/hooks/use-configuration'

export function ConfigurationTokensPage() {
  const { 
    configuration, 
    loading, 
    error, 
    generateRegistrationToken, 
    validateToken
  } = useConfiguration()
  
  const [testToken, setTestToken] = useState('')
  const [testResult, setTestResult] = useState<boolean | null>(null)
  const [testing, setTesting] = useState(false)

  const handleGenerateNewToken = async () => {
    const newToken = await generateRegistrationToken()
    if (newToken) {
      toast.success('Nuevo token de registro generado exitosamente')
    } else {
      toast.error('Error al generar nuevo token')
    }
  }

  const handleTestToken = async () => {
    if (!testToken.trim()) {
      toast.error('Ingresa un token para validar')
      return
    }

    setTesting(true)
    try {
      const isValid = await validateToken(testToken.trim())
      setTestResult(isValid)
      
      if (isValid) {
        toast.success('Token válido')
      } else {
        toast.error('Token inválido o expirado')
      }
    } catch (error) {
      toast.error('Error al validar token')
      setTestResult(false)
    } finally {
      setTesting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTokenAge = (dateString: string) => {
    const now = new Date()
    const tokenDate = new Date(dateString)
    const hoursDiff = Math.floor((now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60))
    
    if (hoursDiff < 1) {
      return { text: 'Recién creado', variant: 'default' as const }
    } else if (hoursDiff < 12) {
      return { text: `${hoursDiff}h de antigüedad`, variant: 'secondary' as const }
    } else if (hoursDiff < 24) {
      return { text: 'Próximo a expirar', variant: 'destructive' as const }
    } else {
      return { text: 'Expirado', variant: 'destructive' as const }
    }
  }

  if (loading && !configuration) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando configuración...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  const tokenAge = configuration?.updated_at ? getTokenAge(configuration.updated_at) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <IconShield className="h-6 w-6" />
          Gestión de Tokens de Registro
        </h1>
        <p className="text-muted-foreground">
          Administra los tokens de seguridad para el registro de nuevos usuarios
        </p>
      </div>

      {/* Token Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconKey className="h-5 w-5" />
            Token de Registro Actual
          </CardTitle>
          <CardDescription>
            Token activo usado para validar invitaciones de registro. Los tokens expiran después de 24 horas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configuration ? (
            <>
              <div className="space-y-2">
                <Label>Token Activo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={configuration.register_link || 'No hay token activo'}
                    readOnly
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Generado: {formatDate(configuration.updated_at)}
                    </span>
                  </div>
                  {tokenAge && (
                    <Badge variant={tokenAge.variant} className="text-xs">
                      {tokenAge.text}
                    </Badge>
                  )}
                </div>

                <Button 
                  onClick={handleGenerateNewToken} 
                  disabled={loading}
                  className="ml-4"
                >
                  <IconRefresh className="h-4 w-4 mr-2" />
                  Generar Nuevo Token
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No hay configuración de tokens disponible</p>
              <Button onClick={handleGenerateNewToken} disabled={loading}>
                <IconKey className="h-4 w-4 mr-2" />
                Generar Primer Token
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Validador de Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Validador de Tokens</CardTitle>
          <CardDescription>
            Prueba la validez de cualquier token de registro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-token">Token a Validar</Label>
            <div className="flex gap-2">
              <Input
                id="test-token"
                placeholder="Pega aquí el token a validar..."
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="font-mono text-xs"
              />
              <Button 
                onClick={handleTestToken} 
                disabled={testing || !testToken.trim()}
              >
                {testing ? (
                  <IconLoader className="h-4 w-4 animate-spin" />
                ) : (
                  'Validar'
                )}
              </Button>
            </div>
          </div>

          {testResult !== null && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              testResult 
                ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'
            }`}>
              {testResult ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  <span className="font-medium">Token válido y activo</span>
                </>
              ) : (
                <>
                  <IconX className="h-4 w-4" />
                  <span className="font-medium">Token inválido o expirado</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>Los tokens de registro expiran automáticamente después de 24 horas por seguridad.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>Cada token se invalida automáticamente después de ser usado exitosamente.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>Solo los usuarios con tokens válidos pueden acceder a la página de registro.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <p>Los tokens incluyen información encriptada sobre códigos de referido y roles asignados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
