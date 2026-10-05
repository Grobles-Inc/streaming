import { cn } from '@/lib/utils'

interface MaintenanceBannerProps {
  className?: string
}

export const MaintenanceBanner = ({
  className,
}: MaintenanceBannerProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 bg-yellow-100 px-4 py-3 text-center text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
        className
      )}
    >
      <img
        src='https://img.icons8.com/?size=100&id=5tH5sHqq0t2q&format=png&color=000000'
        alt=''
        aria-hidden='true'
        className='size-6 shrink-0'
      />
      <p className='text-sm'>
        <span className='font-medium'>Aviso de Mantenimiento</span>
        <span> — El sistema requiere actualizaciones para garantizar su correcto funcionamiento y seguridad.</span>
      </p>
    </div>
  )
}

MaintenanceBanner.displayName = 'MaintenanceBanner'
