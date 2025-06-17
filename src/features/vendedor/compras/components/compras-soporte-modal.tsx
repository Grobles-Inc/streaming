import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { Compra } from '../data/schema'
import { SoporteMessage } from '@/lib/whatsapp'
import { useIsMobile } from '@/hooks/use-mobile'

const subjectOptions = [
  { value: 'soporte', label: 'Soporte' },
  { value: 'reembolso', label: 'Reembolso' },
  { value: 'otro', label: 'Otro' },
  { value: 'vencido', label: 'Cuenta vencida' },
]

interface ComprasSoporteModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  currentRow: Compra
  telefono: string
}

export function ComprasSoporteModal({ open, setOpen, currentRow, telefono }: ComprasSoporteModalProps) {
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const isMobile = useIsMobile()


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Soporte form submitted:', { subject, message, compra: currentRow })
    setOpen(false)
    SoporteMessage({
      nombre_cliente: currentRow.nombre_cliente,
      asunto: subject,
      mensaje: message,
      id_producto: currentRow.id,
      id_cliente: currentRow.id,
    }, telefono, isMobile ? 'mobile' : 'web')
    setSubject('')
    setMessage('')
  }

  const handleClose = () => {
    setOpen(false)
    setSubject('')
    setMessage('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comunicate con el proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <RadioGroup
            value={subject}
            onValueChange={setSubject}
            className="grid grid-cols-3 "
          >
            {subjectOptions.map((option) => (
              <div key={option.value} className="flex items-center  space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>


          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Describe tu problema..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!subject || !message}>
              Enviar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
