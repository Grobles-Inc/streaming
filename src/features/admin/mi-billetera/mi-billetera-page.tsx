import { Main } from '@/components/layout/main'
import { MiBilleteraContent } from './components/mi-billetera-content'

export default function MiBilleteraPage() {
  return (
      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mi Billetera</h2>
            <p className='text-muted-foreground'>
              Gestiona tu billetera personal como administrador. Consulta retiros, comisiones por publicaciones y retiros.
            </p>
          </div>
        </div>
        <MiBilleteraContent />
      </Main>
  )
}
