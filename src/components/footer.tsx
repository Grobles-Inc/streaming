import { Link } from 'lucide-react'

export function Footer() {
  return (
    <footer className='bg-base-300 py-6'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0'>
          <div className='text-sm text-gray-400'>
            © 2026 ML Streaming. Todos los derechos reservados.
          </div>
          <div className='flex items-center space-x-2 text-sm text-gray-400'>
            <span>Desarrollado por</span>
            <Link
              className='text-primary underline'
              href='https://groblestudio.com'
              target='_blank'
            >
              <span>Grobles</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
