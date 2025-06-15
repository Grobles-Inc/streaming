import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { AlertCircleIcon, PaperclipIcon, UploadIcon, XIcon } from "lucide-react"
import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
const initialFiles = [
  {
    name: "document.pdf",
    size: 1528737,
    type: "application/pdf",
    url: "https://picsum.photos/1000/800?grayscale&random=1",
    id: "document.pdf-1744638436563-8u5xuls",
  },
]
const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Por favor, sube un archivo',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'Por favor, sube un archivo en formato CSV.'
    ),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComprasImportDialog({ open, onOpenChange }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const maxSize = 10 * 1024 * 1024
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    maxSize,
    initialFiles,
  })
  const file = files[0]

  const onSubmit = () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, 'Has importado el siguiente archivo:')
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-left'>
          <DialogTitle>Importar Compras</DialogTitle>
          <DialogDescription>
            Importa compras rápidamente desde un archivo CSV.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={() => (
                <FormItem className='mb-2 space-y-1'>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {/* Drop area */}
                      <div
                        role="button"
                        onClick={openFileDialog}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        data-dragging={isDragging || undefined}
                        className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
                      >
                        <input
                          {...getInputProps()}
                          className="sr-only"
                          aria-label="Upload file"
                          disabled={Boolean(file)}
                        />

                        <div className="flex flex-col items-center justify-center text-center">
                          <div
                            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                            aria-hidden="true"
                          >
                            <UploadIcon className="size-4 opacity-60" />
                          </div>
                          <p className="mb-1.5 text-sm font-medium">Subir archivo</p>
                          <p className="text-muted-foreground text-xs">
                            Arrastra y suelta o haz clic para buscar (máx. {formatBytes(maxSize)})
                          </p>
                        </div>
                      </div>

                      {errors.length > 0 && (
                        <div
                          className="text-destructive flex items-center gap-1 text-xs"
                          role="alert"
                        >
                          <AlertCircleIcon className="size-3 shrink-0" />
                          <span>{errors[0]}</span>
                        </div>
                      )}

                      {/* File list */}
                      {file && (
                        <div className="space-y-2">
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 rounded-xl border px-4 py-2"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <PaperclipIcon
                                className="size-4 shrink-0 opacity-60"
                                aria-hidden="true"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium">
                                  {file.file.name}
                                </p>
                              </div>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                              onClick={() => removeFile(files[0]?.id)}
                              aria-label="Remove file"
                            >
                              <XIcon className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cerrar</Button>
          </DialogClose>
          <Button type='submit' form='compras-import-form'>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
