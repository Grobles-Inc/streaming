import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export default function SignIn() {

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>Inicia Sesión</CardTitle>
        </CardHeader>
        <CardContent className='w-sm md:w-auto'>
          <UserAuthForm />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
