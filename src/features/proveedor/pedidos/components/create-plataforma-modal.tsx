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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { PlataformaOption } from '../data/types'
import { useCreatePlataforma } from '../queries'
import {
  getCreatePlataformaError,
  parseKeywords,
  slugifyPlataforma,
} from '../utils/plataforma-utils'

const formSchema = z
  .object({
    label: z.string().trim().min(1, 'El nombre es requerido'),
    // Texto libre separado por comas; se normaliza al guardar.
    keywords: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!slugifyPlataforma(data.label)) {
      ctx.addIssue({
        code: 'custom',
        path: ['label'],
        message: 'El nombre debe incluir al menos una letra o número',
      })
    }
  })

type FormData = z.infer<typeof formSchema>

interface CreatePlataformaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Se llama con la plataforma recién creada para seleccionarla en el form. */
  onCreated: (plataforma: PlataformaOption) => void
}

/**
 * Alta de plataformas desde el <Select> de configuración IMAP (solo admin). El
 * id es el slug del label y se muestra en solo lectura antes de confirmar.
 */
export function CreatePlataformaModal({
  open,
  onOpenChange,
  onCreated,
}: CreatePlataformaModalProps) {
  const createPlataforma = useCreatePlataforma()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { label: '', keywords: '' },
  })

  const slug = slugifyPlataforma(form.watch('label') ?? '')

  useEffect(() => {
    if (open) {
      form.reset({ label: '', keywords: '' })
      setError(null)
    }
    // `form` es estable; solo interesa el cambio de `open`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function onSubmit(data: FormData) {
    if (!slug) return
    setError(null)

    createPlataforma.mutate(
      {
        id: slug,
        label: data.label.trim(),
        keywords: parseKeywords(data.keywords),
      },
      {
        onSuccess: (plataforma) => {
          onCreated(plataforma)
          onOpenChange(false)
        },
        onError: (mutationError) =>
          setError(getCreatePlataformaError(mutationError, slug)),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Nueva plataforma</DialogTitle>
          <DialogDescription>
            Se crea activa de inmediato. El identificador se genera a partir del
            nombre y no se puede editar después.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Universal+' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='space-y-2'>
              <Label htmlFor='nueva-plataforma-slug'>Identificador</Label>
              <Input
                id='nueva-plataforma-slug'
                value={slug}
                readOnly
                placeholder='universal'
              />
              <p className='text-muted-foreground text-xs'>
                Se guarda como id de la plataforma.
              </p>
            </div>
            <FormField
              control={form.control}
              name='keywords'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='universal, universalplus'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separadas por comas; se guardan en minúsculas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className='text-destructive text-sm'>{error}</p>}
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={createPlataforma.isPending}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={createPlataforma.isPending}>
                {createPlataforma.isPending && (
                  <Loader2 className='size-4 animate-spin' />
                )}
                {createPlataforma.isPending ? 'Creando…' : 'Crear'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
