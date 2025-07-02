import { createFileRoute } from '@tanstack/react-router'
import { MiBilleteraPage } from '@/features/admin/mi-billetera'

export const Route = createFileRoute('/_authenticated/admin/mi-billetera/')({
    component: () => <MiBilleteraPage />,

})