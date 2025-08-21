import {
  IconCircleCheck,
  IconExclamationCircle,
  IconFlag,
  IconHelpOctagon,
  IconStopwatch,
  IconRefresh
} from '@tabler/icons-react'

export type PedidoEstado = 'resuelto' | 'soporte' | 'vencido' | 'pedido' | 'entregado' | 'renovado'

export const estadosMap = new Map<PedidoEstado, string>([
  ['resuelto', 'bg-green-500 text-white dark:text-white border-green-500'],
  ['soporte', 'bg-yellow-400 text-white dark:text-white border-yellow-500'],
  ['vencido', 'bg-red-500 text-white dark:text-white border-red-500'],
  ['pedido', 'bg-blue-500 text-white dark:text-white border-blue-500'],
  ['entregado', 'bg-gray-600/30 text-white dark:text-white border-gray-200'],
  ['renovado', 'bg-purple-500 text-white dark:text-white border-purple-500'],
])

export const diasRestantesMap = new Map<number, string>([
  [5, 'bg-red-500 text-white dark:text-white border-red-500'],
  [10, 'bg-orange-400 text-white dark:text-white border-orange-500'],
  [30, 'bg-green-500 text-white dark:text-white border-green-500'],
])

export const estados = [
  {
    value: 'resuelto',
    label: 'Resuelto',
    icon: IconCircleCheck,
    color: 'bg-green-500 text-white dark:text-white border-green-500',
  },
  {
    value: 'soporte',
    label: 'Soporte',
    icon: IconHelpOctagon,
    color: 'bg-yellow-400 text-white dark:text-white border-yellow-500',
  },
  {
    value: 'vencido',
    label: 'Vencido',
    icon: IconStopwatch,
    color: 'bg-red-500 text-white dark:text-white border-red-500',
  },
  {
    value: 'pedido',
    label: 'Pedido',
    icon: IconExclamationCircle,
    color: 'bg-blue-500 text-white dark:text-white border-blue-500',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    icon: IconFlag,
    color: 'bg-gray-600/30 text-white dark:text-white border-gray-200',
  },
  {
    value: 'renovado',
    label: 'Renovado',
    icon: IconRefresh,
    color: 'bg-purple-500 text-white dark:text-white border-purple-500',
  },
] 