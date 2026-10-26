import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { usePlataformas, useSaveImapConfig } from '../queries'

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  host: z.string().min(1, 'El host es requerido'),
  port: z.coerce.number().min(1, 'Puerto inválido').max(65535, 'Puerto inválido'),
  usuario: z.string().min(1, 'El usuario es requerido'),
  // Vacía = reusa la que ya está en Vault (nunca se recuperó al cliente).
  password: z.string(),
  ssl: z.boolean(),
  plataforma: z.string().min(1, 'Selecciona una plataforma'),
})

type FormData = z.infer<typeof formSchema>

interface ImapConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockProductoId: number
  /** Email de la cuenta del pedido, usado para prefillear el formulario. */
  email: string | null
  /** Estado IMAP ya guardado de la cuenta (viene de la fila del pedido). */
  estado: {
    configurado: boolean
    plataforma: string | null
    host: string | null
    port: number | null
    usuario: string | null
    ssl: boolean
  }
}

/**
 * Configuración IMAP de la cuenta de stock de un pedido. La connection se
 * verifica server-side antes de guardar y el password solo existe en Vault:
 * nunca se recupera ni se muestra, por eso el campo es opcional (vacío =
 * se conserva la contraseña guardada).
 */
export function ImapConfigDialog({
  open,
  onOpenChange,
  stockProductoId,
  email,
  estado,
}: ImapConfigDialogProps) {
  const { user } = useAuth()
  const saveConfig = useSaveImapConfig()
  const { data: plataformas = [], isLoading: plataformasLoading } =
    usePlataformas()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: {
      email: email ?? '',
      host: estado.host ?? 'imap.gmail.com',
      port: estado.port ?? 993,
      usuario: estado.usuario ?? email ?? '',
      password: '',
      ssl: estado.configurado ? estado.ssl : true,
      plataforma: estado.plataforma ?? '',
    },
  })

  function onSubmit(data: FormData) {
    if (!user?.id) {
      toast.error('Sesión requerida')
      return
    }
    const { password, ...resto } = data
    saveConfig.mutate(
      {
        input: {
          ...resto,
          // Vacía = reusar el secreto de Vault.
          ...(password ? { password } : {}),
          stock_producto_id: stockProductoId,
        },
        userId: user.id,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Configurar IMAP</DialogTitle>
          <DialogDescription>
            Conecta el correo de esta cuenta para obtener códigos de verificación
            automáticamente. La conexión se verifica antes de guardar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder='cuenta@ejemplo.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='plataforma'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plataforma</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={plataformasLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            plataformasLoading
                              ? 'Cargando plataformas…'
                              : 'Selecciona una plataforma'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plataformas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='host'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder='imap.gmail.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='port'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puerto</FormLabel>
                    <FormControl>
                      <Input type='number' placeholder='993' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='usuario'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder='usuario IMAP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {estado.configurado
                      ? 'Nueva contraseña (opcional)'
                      : 'Contraseña / App password'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder={
                        estado.configurado
                          ? 'Dejala vacía para conservar la actual'
                          : '••••••••'
                      }
                      autoComplete='new-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {estado.configurado && (
                    <p className='text-muted-foreground text-xs'>
                      Hay una configuración guardada para esta cuenta. La
                      contraseña no se muestra por seguridad; solo se usa la que
                      escribas aquí.
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='ssl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSL / TLS</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={saveConfig.isPending}>
                {saveConfig.isPending && (
                  <Loader2 className='size-4 animate-spin' />
                )}
                {saveConfig.isPending ? 'Verificando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
