import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { PhoneInput } from '../landing/categorias/components/phone-input'
import { usuarioSchema } from './data/schema'
import { useAuth } from '@/stores/authStore'


type ProfileFormValues = z.infer<typeof usuarioSchema>



export default function SettingsProfile() {
  const { user } = useAuth()
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      usuario: user?.usuario || '',
      nombres: user?.nombres || '',
      apellidos: user?.apellidos || '',
      telefono: user?.telefono || '',
      email: user?.email || '',
      codigo_referido: user?.codigo_referido || '',
    },
    mode: 'onChange',
  })


  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>

        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Perfil de Cuenta
          </h1>
          <p className='text-muted-foreground'>
            Administra la información de tu cuenta y ajusta tus preferencias.
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>

          <div className='flex w-full overflow-y-hidden p-1'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
                className='space-y-8'
              >
                <FormField
                  control={form.control}
                  name='usuario'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej. juan_perez' {...field} />
                      </FormControl>
                      <FormDescription>
                        Este es el nombre de usuario que se mostrará en la plataforma, ademas te servirá para iniciar sesión.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={() => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej. juan@gmail.com' disabled value={user?.email} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='nombres'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej. Juan' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='apellidos'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej. Perez' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <PhoneInput {...field} defaultCountry="PE" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Código Referido</FormLabel>
                  <FormControl>
                    <Input disabled value={user?.codigo_referido} />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <Button type='submit' disabled>Actualizar Perfil</Button>
              </form>
            </Form>

          </div>
        </div>
      </Main>
    </>
  )
}
