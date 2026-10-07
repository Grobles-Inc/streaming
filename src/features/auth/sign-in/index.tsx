import { useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {
  const { motivo } = useSearch({ from: '/(auth)/sign-in' })

  useEffect(() => {
    if (motivo === 'registro-cerrado') {
      toast.info('El registro público está cerrado por el momento')
    }
  }, [motivo])

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Inicia Sesión
          </CardTitle>
        </CardHeader>
        <CardContent className='w-sm md:w-auto'>
          <UserAuthForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
