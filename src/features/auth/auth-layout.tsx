import Logo from '@/assets/logo.png'
import { Link } from '@tanstack/react-router'

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='bg-background container relative grid h-svh max-w-none items-center justify-center overflow-hidden'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,color-mix(in_oklch,var(--primary)_38%,transparent),transparent_70%)]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_105%,color-mix(in_oklch,var(--primary)_22%,transparent),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_105%,color-mix(in_oklch,var(--primary)_38%,transparent),transparent_70%)]'
      />
      <div className='relative mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <Link to='/'>
            <img src={Logo} alt='ML Streaming' className='md:h-30 h-20 w-auto dark:invert' />
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
