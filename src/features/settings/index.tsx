import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PhoneInput } from '../landing/categorias/components/phone-input'
import { usuarioSchema } from './data/schema'


type ProfileFormValues = z.infer<typeof usuarioSchema>



export default function SettingsProfile() {
  const { user, updateUser } = useAuth()
  const [copied, setCopied] = useState(false)
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

  const onSubmit = (data: ProfileFormValues) => {
    updateUser({
      id: user?.id ?? '',
      nombres: data.nombres,
      apellidos: data.apellidos,
      telefono: data.telefono,
      email: data.email,
      codigo_referido: data.codigo_referido,
    })
    toast.success('Perfil actualizado correctamente')
  }


  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>

        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main >
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

          <div className='flex flex-col  overflow-y-hidden p-1'>
            <div className='space-y-1 mb-4'>
              <Label>Código Referido</Label>
              <div className='flex items-center gap-2'>
                <Input disabled value={user?.codigo_referido} />
                <Button title='Copiar Codigo' variant='outline' size='icon' onClick={() => {
                  navigator.clipboard.writeText(user?.codigo_referido || '')
                  setCopied(true)
                  setTimeout(() => {
                    setCopied(false)
                  }, 1000)
                  toast.success('Código copiado')
                }}>
                  {copied ? <IconCheck /> : <IconCopy />}
                </Button>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                <FormField
                  control={form.control}
                  name='usuario'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input disabled placeholder='Ej. juan_perez' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='Ej. juan@gmail.com' {...field} />
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



                <Button type='submit' className='w-full md:w-auto' >Actualizar Perfil</Button>
              </form>
            </Form>
          </div>
        </div>
      </Main>
    </>
  )
}
