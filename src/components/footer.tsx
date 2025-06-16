import { Link } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-base-300  py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-gray-400 text-sm">
            © 2024 Dark+ Streaming. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>Desarrollado por</span>
            <Link className='text-primary underline' href="https://grobles.framer.website" target="_blank">
              <span>Grobles</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
