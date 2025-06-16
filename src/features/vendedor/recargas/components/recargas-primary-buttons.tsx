import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'
import { useRecargas } from '../context/recargas-context'

export function RecargasPrimaryButtons() {
  const { setOpen } = useRecargas()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Crear</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
