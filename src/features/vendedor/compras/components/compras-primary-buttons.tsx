import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
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
        <span>Importar</span> <IconDownload size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Comprar</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
