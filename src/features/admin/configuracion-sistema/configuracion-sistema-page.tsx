import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { useState, useEffect, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { useConfiguracion } from './hooks/use-configuracion'
import { HistorialConfiguracionCard } from './components/historial-configuracion'
import { SignupSettingsCard } from './components/signup-settings-card'
import { DEFAULT_BINANCE_INFO, DEFAULT_YAPE_INFO } from '@/lib/recarga-info'
import { SupabaseStorageService } from '@/lib/supabase'
import YapeQRImage from '@/assets/YapeQR.jpg'

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
  const [comisionPublicacion, setComisionPublicacion] = useState(1.35)

  // Estado para información de recarga (Yape / Binance)
  const [commPhone, setCommPhone] = useState(DEFAULT_YAPE_INFO.comm_phone ?? '')
  const [qrUrl, setQrUrl] = useState<string>('')
  const [yapeNumber, setYapeNumber] = useState(DEFAULT_YAPE_INFO.yape_number ?? '')
  const [yapeName, setYapeName] = useState(DEFAULT_YAPE_INFO.yape_name ?? '')
  const [binanceId, setBinanceId] = useState(DEFAULT_BINANCE_INFO.binance_id ?? '')
  const [binanceName, setBinanceName] = useState(DEFAULT_BINANCE_INFO.binance_name ?? '')
  const [usdtRate, setUsdtRate] = useState(String(DEFAULT_BINANCE_INFO.usdt_rate ?? 3.2))
  const [binanceQrUrl, setBinanceQrUrl] = useState<string>('')
  const [uploadingQr, setUploadingQr] = useState(false)
  const [uploadingBinanceQr, setUploadingBinanceQr] = useState(false)

  // Estado para mostrar/ocultar historial
  const [showHistorial, setShowHistorial] = useState(false)

  // Sincronizar estado local con la configuración cargada
  useEffect(() => {
    if (configuracion) {
      setMantenimiento(configuracion.mantenimiento)
      setEmailSoporte(configuracion.email_soporte || '')
      setComision(configuracion.comision)
      setConversion(configuracion.conversion)
      setComisionPublicacion(configuracion.comision_publicacion_producto)

      const yape = configuracion.yape_info
      setCommPhone(yape?.comm_phone ?? DEFAULT_YAPE_INFO.comm_phone ?? '')
      setQrUrl(yape?.qr_url ?? '')
      setYapeNumber(yape?.yape_number ?? DEFAULT_YAPE_INFO.yape_number ?? '')
      setYapeName(yape?.yape_name ?? DEFAULT_YAPE_INFO.yape_name ?? '')

      const binance = configuracion.binance_info
      setBinanceId(binance?.binance_id ?? DEFAULT_BINANCE_INFO.binance_id ?? '')
      setBinanceName(binance?.binance_name ?? DEFAULT_BINANCE_INFO.binance_name ?? '')
      setUsdtRate(String(binance?.usdt_rate ?? DEFAULT_BINANCE_INFO.usdt_rate ?? 3.2))
      setBinanceQrUrl(binance?.qr_url ?? '')
    }
  }, [configuracion])

  // Cargar historial cuando se muestre
  useEffect(() => {
    if (showHistorial && historial.length === 0) {
      loadHistorial()
    }
  }, [showHistorial, historial.length, loadHistorial])




  const handleQrUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingQr(true)
      // Limpieza automática del QR anterior (si existía en el bucket de configuración)
      if (qrUrl) {
        await SupabaseStorageService.deleteConfiguracionImage(qrUrl)
      }
      const url = await SupabaseStorageService.uploadConfiguracionImage(file)
      setQrUrl(url)
      toast.success('QR subido correctamente')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir el QR')
    } finally {
      setUploadingQr(false)
      e.target.value = ''
    }
  }

  const handleBinanceQrUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingBinanceQr(true)
      // Limpieza automática del QR anterior (si existía en el bucket de configuración)
      if (binanceQrUrl) {
        await SupabaseStorageService.deleteConfiguracionImage(binanceQrUrl)
      }
      const url = await SupabaseStorageService.uploadConfiguracionImage(file)
      setBinanceQrUrl(url)
      toast.success('QR de Binance subido correctamente')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Error al subir el QR de Binance'
      )
    } finally {
      setUploadingBinanceQr(false)
      e.target.value = ''
    }
  }

  // Manejar guardado de configuración
  const handleSaveAll = async () => {
    const success = await saveConfiguracion({
      mantenimiento: mantenimiento,
      email_soporte: emailSoporte,
      comision: comision,
      conversion: conversion,
      comision_publicacion_producto: comisionPublicacion,
      yape_info: {
        qr_url: qrUrl || null,
        yape_number: yapeNumber || null,
        yape_name: yapeName || null,
        comm_phone: commPhone || null,
      },
      binance_info: {
        qr_url: binanceQrUrl || null,
        binance_id: binanceId || null,
        binance_name: binanceName || null,
        usdt_rate: Number(usdtRate) || DEFAULT_BINANCE_INFO.usdt_rate,
      },
    })

    if (success) {
      toast.success('Configuración guardada correctamente')
    } else {
      toast.error('Error al guardar la configuración')
    }
  }

  // Manejar restauración de configuración
  const handleRestore = async (id: number) => {
    const success = await restaurarConfiguracion(id)
    
    if (success) {
      toast.success('Configuración restaurada correctamente')
    } else {
      toast.error('Error al restaurar la configuración')
    }
  }

  // Verificar si hay cambios pendientes
    const currentYape = configuracion?.yape_info
  const currentBinance = configuracion?.binance_info

  const hasChanges = configuracion && (
    mantenimiento !== configuracion.mantenimiento ||
    emailSoporte !== (configuracion.email_soporte || '') ||
    comision !== configuracion.comision ||
    conversion !== configuracion.conversion ||
    comisionPublicacion !== configuracion.comision_publicacion_producto ||
    commPhone !== (currentYape?.comm_phone ?? DEFAULT_YAPE_INFO.comm_phone ?? '') ||
    qrUrl !== (currentYape?.qr_url ?? '') ||
    yapeNumber !== (currentYape?.yape_number ?? DEFAULT_YAPE_INFO.yape_number ?? '') ||
    yapeName !== (currentYape?.yape_name ?? DEFAULT_YAPE_INFO.yape_name ?? '') ||
    binanceId !== (currentBinance?.binance_id ?? DEFAULT_BINANCE_INFO.binance_id ?? '') ||
    binanceName !== (currentBinance?.binance_name ?? DEFAULT_BINANCE_INFO.binance_name ?? '') ||
    usdtRate !== String(currentBinance?.usdt_rate ?? DEFAULT_BINANCE_INFO.usdt_rate ?? 3.2) ||
    binanceQrUrl !== (currentBinance?.qr_url ?? '')
  )

  if (loading) {
    return (
        <Main>
          <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96 mt-2" />
            </div>
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
    )
  }

  return (
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Configuración del Sistema</h2>
            <p className='text-muted-foreground'>
              Administra la configuración general del sistema y comisiones.
            </p>
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          <div className='flex items-center gap-2'>
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
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-2 pt-10'>

          {/* Registro de usuarios */}
          <SignupSettingsCard />

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
                Porcentaje de comisión aplicado a los retiros de los usuarios.
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

        {/* Fila adicional para conversión y comisión publicación */}
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

          {/* Comisión de publicación */}
          <Card>
            <CardHeader>
              <CardTitle>Comisión Publicación Producto</CardTitle>
              <CardDescription>
                Costo que se cobra a los proveedores por publicar un producto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Input
                  type='number'
                  value={comisionPublicacion}
                  min={0}
                  step={0.01}
                  onChange={e => setComisionPublicacion(Number(e.target.value))}
                  className='w-32'
                  disabled={saving}
                />
                <span className="text-sm text-muted-foreground">COP</span>
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

        {/* Información de recarga (Yape / Binance) */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Recarga - Yape</CardTitle>
              <CardDescription>
                QR, número de Yape y teléfono de comunicación visibles en el dialog de recarga.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de comunicación (WhatsApp)</label>
                <Input
                  value={commPhone}
                  onChange={e => setCommPhone(e.target.value)}
                  placeholder="51913190401"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Yape</label>
                <Input
                  value={yapeNumber}
                  onChange={e => setYapeNumber(e.target.value)}
                  placeholder="+51 913 190 401"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del titular (Yape)</label>
                <Input
                  value={yapeName}
                  onChange={e => setYapeName(e.target.value)}
                  placeholder="Juan Laura P."
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">QR de Yape</label>
                {qrUrl && (
                  <img src={qrUrl} alt="QR Yape" className="h-40 w-40 object-contain border rounded" />
                )}
                {!qrUrl && (
                  <img src={YapeQRImage} alt="QR Yape por defecto" className="h-40 w-40 object-contain border rounded opacity-70" />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  disabled={saving || uploadingQr}
                />
                {uploadingQr && <p className="text-xs text-muted-foreground">Subiendo QR...</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Recarga - Binance</CardTitle>
              <CardDescription>
                Datos de la cuenta Binance y QR mostrados en el dialog de recarga.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID de Binance</label>
                <Input
                  value={binanceId}
                  onChange={e => setBinanceId(e.target.value)}
                  placeholder="1096171177"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del titular (Binance)</label>
                <Input
                  value={binanceName}
                  onChange={e => setBinanceName(e.target.value)}
                  placeholder="Melvy L."
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tasa (1 USDT en soles)</label>
                <Input
                  type="number"
                  value={usdtRate}
                  min={0}
                  step={0.01}
                  onChange={e => setUsdtRate(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">QR de Binance</label>
                {binanceQrUrl && (
                  <img src={binanceQrUrl} alt="QR Binance" className="h-40 w-40 object-contain border rounded" />
                )}
                {!binanceQrUrl && (
                  <p className="text-xs text-muted-foreground">Sin QR configurado</p>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBinanceQrUpload}
                  disabled={saving || uploadingBinanceQr}
                />
                {uploadingBinanceQr && <p className="text-xs text-muted-foreground">Subiendo QR...</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón para guardar todos los cambios */}
        {hasChanges && (
          <div className="grid gap-6 md:grid-cols-1 mt-6">
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
          </div>
        )}



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
        {/* <MantenimientoConfirmDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          activar={pendingMantenimiento}
          onConfirm={confirmMantenimientoChange}
        /> */}
      </Main>
  )
}