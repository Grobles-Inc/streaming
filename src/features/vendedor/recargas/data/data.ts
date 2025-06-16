import {
  IconBan,
  IconProgressCheck,
  IconTimeDuration0
} from '@tabler/icons-react'
import { RecargaEstado } from './schema'

export const estados = [
  {
    value: 'aprobado',
    label: 'Aprobado',
    icon: IconProgressCheck,
  },
  {
    value: 'pendiente',
    label: 'Pendiente',
    icon: IconTimeDuration0,
  },
  {
    value: 'rechazado',
    label: 'Rechazado',
    icon: IconBan,
  },
]
export const estadosMap = new Map<RecargaEstado, string>([
  ['aprobado', 'bg-green-500 text-white dark:text-white border-green-500'],
  ['pendiente', 'bg-yellow-400 text-white dark:text-white border-yellow-500'],
  ['rechazado', 'bg-red-500 text-white dark:text-white border-red-500'],
])


