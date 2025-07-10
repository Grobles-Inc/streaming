import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function UnauthorisedError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>Acceso no autorizado</span>
        <p className='text-muted-foreground text-center'>
          Por favor, inicie sesión con las credenciales adecuadas <br /> para acceder a este recurso.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Volver a la página anterior
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Volver a la página de inicio</Button>
        </div>
      </div>
    </div>
  )
}
