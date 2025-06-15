import { Button } from '@/components/ui/button'
import { IconUpload } from '@tabler/icons-react'
import { useCompras } from '../context/compras-context'

export function ComprasPrimaryButtons() {
  const { setOpen } = useCompras()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Importar</span> <IconUpload size={18} />
      </Button>
    </div>
  )
}
