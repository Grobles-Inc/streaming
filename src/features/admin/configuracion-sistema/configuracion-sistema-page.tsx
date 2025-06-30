import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useConfiguracion } from './hooks/use-configuracion'
import { MantenimientoConfirmDialog } from './components/mantenimiento-confirm-dialog'
import { HistorialConfiguracionCard } from './components/historial-configuracion'

export default function ConfiguracionSistemaPage() {
  const {
    configuracion,
    historial,
    loading,
    saving,
    error,
    loadHistorial,
    saveConfiguracion,
    restaurarConfiguracion
  } = useConfiguracion()

  // Estados locales para el formulario
  const [mantenimiento, setMantenimiento] = useState(false)
  const [emailSoporte, setEmailSoporte] = useState('')
  const [comision, setComision] = useState(10)
  const [conversion, setConversion] = useState(1)

  // Estado para el modal de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingMantenimiento, setPendingMantenimiento] = useState(false)

  // Estado para mostrar/ocultar historial
  const [showHistorial, setShowHistorial] = useState(false)

  // Sincronizar estado local con la configuración cargada
  useEffect(() => {
    if (configuracion) {
      setMantenimiento(configuracion.mantenimiento)
      setEmailSoporte(configuracion.email_soporte || '')
      setComision(configuracion.comision)
      setConversion(configuracion.conversion)
    }
  }, [configuracion])

  // Cargar historial cuando se muestre
  useEffect(() => {
    if (showHistorial && historial.length === 0) {
      loadHistorial()
    }
  }, [showHistorial, historial.length, loadHistorial])

  // Manejar cambio de modo mantenimiento con confirmación
  const handleMantenimientoChange = (checked: boolean) => {
    setPendingMantenimiento(checked)
    setShowConfirmDialog(true)
  }

  // Confirmar cambio de modo mantenimiento
  const confirmMantenimientoChange = async () => {
    setMantenimiento(pendingMantenimiento)
    setShowConfirmDialog(false)
    
    // Guardar automáticamente cuando se cambia el mantenimiento
    await handleSaveAll()
  }

  // Manejar guardado de configuración
  const handleSaveAll = async () => {
    const success = await saveConfiguracion({
      mantenimiento: mantenimiento,
      email_soporte: emailSoporte,
      comision: comision,
      conversion: conversion
    })

    if (success) {
      toast.success('Configuración guardada correctamente')
    } else {
      toast.error('Error al guardar la configuración')
    }
  }

  // Manejar restauración de configuración
  const handleRestore = async (id: string) => {
    const success = await restaurarConfiguracion(id)
    
    if (success) {
      toast.success('Configuración restaurada correctamente')
    } else {
      toast.error('Error al restaurar la configuración')
    }
  }

  // Verificar si hay cambios pendientes
  const hasChanges = configuracion && (
    mantenimiento !== configuracion.mantenimiento ||
    emailSoporte !== (configuracion.email_soporte || '') ||
    comision !== configuracion.comision ||
    conversion !== configuracion.conversion
  )

  if (loading) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Skeleton className="h-9 w-32" />
          </div>
        </Header>
        <Main>
          <div className='mb-2 flex items-center justify-between space-y-2'>
            <Skeleton className="h-8 w-64" />
          </div>
          <div className='grid gap-6 md:grid-cols-2'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full mb-4" />
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button
            variant="outline"
            onClick={() => setShowHistorial(!showHistorial)}
          >
            {showHistorial ? 'Ocultar' : 'Ver'} Historial
          </Button>
          {hasChanges && (
            <Badge variant="secondary">
              Cambios pendientes
            </Badge>
          )}
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Configuración del Sistema</h1>
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2'>
          {/* Modo mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Modo Mantenimiento
                {configuracion?.mantenimiento && (
                  <Badge variant="destructive">Activo</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Activa el modo mantenimiento para mostrar un mensaje a todos los usuarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                <Switch 
                  checked={mantenimiento} 
                  onCheckedChange={handleMantenimientoChange}
                  disabled={saving}
                />
                <span>{mantenimiento ? 'Activado' : 'Desactivado'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Los cambios en el modo mantenimiento se guardan automáticamente.
              </p>
            </CardContent>
          </Card>

          {/* Información de la configuración actual */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Última actualización:</span>{' '}
                  {configuracion?.updatedAt ? 
                    new Intl.DateTimeFormat('es-ES', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    }).format(configuracion.updatedAt) 
                    : 'No disponible'
                  }
                </div>
                <div>
                  <span className="font-medium">Estado del sistema:</span>{' '}
                  <Badge variant={configuracion?.mantenimiento ? 'destructive' : 'secondary'}>
                    {configuracion?.mantenimiento ? 'En mantenimiento' : 'Operativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email de soporte */}
          <Card>
            <CardHeader>
              <CardTitle>Email de Soporte</CardTitle>
              <CardDescription>
                Correo electrónico visible para consultas y soporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={emailSoporte}
                onChange={e => setEmailSoporte(e.target.value)}
                placeholder='soporte@streaming.com'
                type="email"
                disabled={saving}
              />
              <Button 
                className='mt-4' 
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                size="sm"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>

          {/* Comisión global */}
          <Card>
            <CardHeader>
              <CardTitle>Comisión Global (%)</CardTitle>
              <CardDescription>
                Porcentaje de comisión aplicado a las ventas de productos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type='number'
                  value={comision}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={e => setComision(Number(e.target.value))}
                  className='w-32'
                  disabled={saving}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <Button 
                className='mt-4' 
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                size="sm"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fila adicional para conversión */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-6">
          {/* Tasa de conversión */}
          <Card>
            <CardHeader>
              <CardTitle>Tasa de Conversión</CardTitle>
              <CardDescription>
                Factor de conversión usado en cálculos del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type='number'
                  value={conversion}
                  min={0}
                  step={0.01}
                  onChange={e => setConversion(Number(e.target.value))}
                  className='w-32'
                  disabled={saving}
                />
                <span className="text-sm text-muted-foreground">factor</span>
              </div>
              <Button 
                className='mt-4' 
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                size="sm"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardContent>
          </Card>

          {/* Botón para guardar todos los cambios */}
          {hasChanges && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-800">Cambios Pendientes</CardTitle>
                <CardDescription>
                  Tienes cambios sin guardar en la configuración.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Historial de configuraciones */}
        {showHistorial && (
          <div className="mt-6">
            <HistorialConfiguracionCard
              historial={historial}
              onRestore={handleRestore}
              loading={saving}
            />
          </div>
        )}

        {/* Modal de confirmación para modo mantenimiento */}
        <MantenimientoConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          activar={pendingMantenimiento}
          onConfirm={confirmMantenimientoChange}
        />
      </Main>
    </>
  )
}