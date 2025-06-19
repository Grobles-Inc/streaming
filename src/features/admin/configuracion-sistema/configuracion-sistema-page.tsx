import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useState } from 'react'
import { RoleGuard } from '@/components/role-guard'

export default function ConfiguracionSistemaPage() {
  const [mantenimiento, setMantenimiento] = useState(false)
  const [emailSoporte, setEmailSoporte] = useState('soporte@tusitio.com')
  const [comision, setComision] = useState(10)

  return (
    <RoleGuard allowedRoles={['admin']}>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          {/* Puedes agregar aquí buscador o acciones rápidas */}
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Configuración del Sistema</h1>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Modo mantenimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Modo Mantenimiento</CardTitle>
              <CardDescription>
                Activa el modo mantenimiento para mostrar un mensaje a todos los usuarios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-4'>
                <Switch checked={mantenimiento} onCheckedChange={setMantenimiento} />
                <span>{mantenimiento ? 'Activado' : 'Desactivado'}</span>
              </div>
              <Button className='mt-4'>Guardar</Button>
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
                placeholder='soporte@tusitio.com'
              />
              <Button className='mt-4'>Guardar</Button>
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
              <Input
                type='number'
                value={comision}
                min={0}
                max={100}
                onChange={e => setComision(Number(e.target.value))}
                className='w-24'
              />
              <Button className='mt-4'>Guardar</Button>
            </CardContent>
          </Card>
        </div>
      </Main>
    </RoleGuard>
  )
}